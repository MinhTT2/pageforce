import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { normalizePageSchema } from "@/lib/blocks";
import {
  MAX_PAGE_BODY_BYTES,
  pagePublicationData,
  schemaToJson,
  toEditablePage,
  updatePageWithUniqueSlug,
} from "@/lib/pages";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";
import { pagePatchValidator } from "@/lib/validators";

type EditablePageRecord = Parameters<typeof toEditablePage>[0];
type SitePageRecord = NonNullable<EditablePageRecord["site"]["pages"]>[number];
type SitePageRecordWithoutSite = Omit<SitePageRecord, "site">;
type EditablePageRecordWithSummaryPages = Omit<EditablePageRecord, "site"> & {
  site: Omit<EditablePageRecord["site"], "pages"> & {
    pages: SitePageRecordWithoutSite[];
  };
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId } = await params;
  const page = await prisma.page.findFirst({
    where: { id: pageId, site: { is: { userId: user.id } } },
    select: {
      id: true,
      siteId: true,
      title: true,
      slug: true,
      isHome: true,
      headerMode: true,
      footerMode: true,
      status: true,
      updatedAt: true,
      schema: true,
      site: {
        select: {
          id: true,
          name: true,
          slug: true,
          globalHeader: true,
          globalFooter: true,
          updatedAt: true,
          pages: {
            select: {
              id: true,
              siteId: true,
              title: true,
              slug: true,
              isHome: true,
              headerMode: true,
              footerMode: true,
              status: true,
              updatedAt: true,
            },
            orderBy: [{ isHome: "desc" }, { updatedAt: "desc" }],
          },
        },
      },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(toEditablePage(withSitePageSummaries(page)));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId } = await params;
  const json = await readJsonBody(request, MAX_PAGE_BODY_BYTES);

  if (!json.ok) {
    return NextResponse.json({ error: json.error }, { status: json.status });
  }

  const parsed = pagePatchValidator.safeParse(json.value);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  const page = await prisma.page.findFirst({
    where: { id: pageId, site: { is: { userId: user.id } } },
    select: {
      id: true,
      siteId: true,
      slug: true,
      isHome: true,
      updatedAt: true,
      site: { select: { slug: true } },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const data = parsed.data;

  if (data.lastKnownUpdatedAt && data.lastKnownUpdatedAt !== page.updatedAt.toISOString()) {
    return NextResponse.json(
      { error: "This page changed in another tab. Reload before saving again." },
      { status: 409 },
    );
  }

  const normalizedSchema = data.schema ? normalizePageSchema(data.schema) : null;
  const schema = normalizedSchema ? schemaToJson(normalizedSchema) : null;
  const publication = normalizedSchema ? pagePublicationData(normalizedSchema) : null;
  const updateData = {
    ...(data.title ? { title: data.title } : {}),
    ...(typeof data.isHome === "boolean" ? { isHome: data.isHome } : {}),
    ...(data.headerMode ? { headerMode: data.headerMode } : {}),
    ...(data.footerMode ? { footerMode: data.footerMode } : {}),
    ...(schema ? { schema } : {}),
    ...(publication
      ? {
          status: publication.status,
        }
      : {}),
  };
  await prisma.$transaction(async (tx) => {
    if (data.isHome) {
      await tx.page.updateMany({
        where: { siteId: page.siteId, id: { not: pageId } },
        data: { isHome: false },
      });
    }

    const write = (slug: string) =>
      tx.page.update({
        where: { id: pageId },
        data: { ...updateData, slug },
        select: { id: true },
      });

    return data.slug
      ? updatePageWithUniqueSlug(data.slug, pageId, page.siteId, write, tx)
      : write(page.slug);
  });

  const updated = await prisma.page.findFirst({
    where: { id: pageId, site: { is: { userId: user.id } } },
    select: {
      id: true,
      siteId: true,
      title: true,
      slug: true,
      isHome: true,
      headerMode: true,
      footerMode: true,
      status: true,
      updatedAt: true,
      schema: true,
      site: {
        select: {
          id: true,
          name: true,
          slug: true,
          globalHeader: true,
          globalFooter: true,
          updatedAt: true,
          pages: {
            select: {
              id: true,
              siteId: true,
              title: true,
              slug: true,
              isHome: true,
              headerMode: true,
              footerMode: true,
              status: true,
              updatedAt: true,
            },
            orderBy: [{ isHome: "desc" }, { updatedAt: "desc" }],
          },
        },
      },
    },
  });

  if (!updated) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  revalidatePath(`/s/${page.site.slug}`);
  revalidatePath(`/s/${updated.site.slug}`);
  if (!page.isHome) revalidatePath(`/s/${page.site.slug}/${page.slug}`);
  if (!updated.isHome) revalidatePath(`/s/${updated.site.slug}/${updated.slug}`);

  return NextResponse.json(toEditablePage(withSitePageSummaries(updated)));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId } = await params;
  const page = await prisma.page.findFirst({
    where: { id: pageId, site: { is: { userId: user.id } } },
    select: { id: true, siteId: true, slug: true, isHome: true, site: { select: { slug: true } } },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.page.delete({ where: { id: pageId } });

    if (page.isHome) {
      const nextHome = await tx.page.findFirst({
        where: { siteId: page.siteId },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });

      if (nextHome) {
        await tx.page.update({ where: { id: nextHome.id }, data: { isHome: true } });
      }
    }
  });
  revalidatePath(`/s/${page.site.slug}`);
  if (!page.isHome) revalidatePath(`/s/${page.site.slug}/${page.slug}`);

  return NextResponse.json({ ok: true });
}

function withSitePageSummaries(page: EditablePageRecordWithSummaryPages): EditablePageRecord {
  return {
    ...page,
    site: {
      ...page.site,
      pages: page.site.pages.map((sitePage) => ({
        ...sitePage,
        site: { name: page.site.name, slug: page.site.slug },
      })),
    },
  };
}
