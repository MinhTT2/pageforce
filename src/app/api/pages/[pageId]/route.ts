import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
    include: {
      site: {
        include: {
          pages: {
            include: { site: { select: { name: true, slug: true } } },
            orderBy: [{ isHome: "desc" }, { updatedAt: "desc" }],
          },
        },
      },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(toEditablePage(page));
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
  const normalizedHeaderSchema = data.headerSchema
    ? normalizePageSchema(data.headerSchema)
    : data.headerSchema === null
      ? null
      : undefined;
  const normalizedFooterSchema = data.footerSchema
    ? normalizePageSchema(data.footerSchema)
    : data.footerSchema === null
      ? null
      : undefined;
  const schema = normalizedSchema ? schemaToJson(normalizedSchema) : null;
  const publication = normalizedSchema ? pagePublicationData(normalizedSchema) : null;
  const updateData = {
    ...(data.title ? { title: data.title } : {}),
    ...(typeof data.isHome === "boolean" ? { isHome: data.isHome } : {}),
    ...(data.headerMode ? { headerMode: data.headerMode } : {}),
    ...(data.footerMode ? { footerMode: data.footerMode } : {}),
    ...(normalizedHeaderSchema !== undefined
      ? { headerSchema: normalizedHeaderSchema ? schemaToJson(normalizedHeaderSchema) : Prisma.DbNull }
      : {}),
    ...(normalizedFooterSchema !== undefined
      ? { footerSchema: normalizedFooterSchema ? schemaToJson(normalizedFooterSchema) : Prisma.DbNull }
      : {}),
    ...(schema ? { draftSchema: schema } : {}),
    ...(publication
      ? {
          status: publication.status,
          publishedSchema: publication.publishedSchema,
          publishedAt: publication.publishedAt,
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
    include: {
      site: {
        include: {
          pages: {
            include: { site: { select: { name: true, slug: true } } },
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

  return NextResponse.json(toEditablePage(updated));
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
