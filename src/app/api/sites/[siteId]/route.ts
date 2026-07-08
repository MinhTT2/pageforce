import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { normalizePageSchema } from "@/lib/blocks";
import { schemaToJson, toSiteSummary, updateSiteWithUniqueSlug, MAX_PAGE_BODY_BYTES } from "@/lib/pages";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";
import { sitePatchValidator } from "@/lib/validators";

// Cached public pages are tagged by concrete URL, so site-wide changes
// (slug rename, global header/footer, delete) must revalidate every page path.
function revalidateSitePaths(siteSlugs: string[], pageSlugs: string[]) {
  for (const siteSlug of new Set(siteSlugs)) {
    revalidatePath(`/s/${siteSlug}`);
    for (const pageSlug of pageSlugs) {
      revalidatePath(`/s/${siteSlug}/${pageSlug}`);
    }
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await params;
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user.id },
    select: { id: true, slug: true, pages: { select: { slug: true } } },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const json = await readJsonBody(request, MAX_PAGE_BODY_BYTES);

  if (!json.ok) {
    return NextResponse.json({ error: json.error }, { status: json.status });
  }

  const parsed = sitePatchValidator.safeParse(json.value);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const data = parsed.data;
  const globalHeader =
    data.globalHeader === undefined
      ? undefined
      : data.globalHeader
        ? schemaToJson(normalizePageSchema(data.globalHeader))
        : Prisma.DbNull;
  const globalFooter =
    data.globalFooter === undefined
      ? undefined
      : data.globalFooter
        ? schemaToJson(normalizePageSchema(data.globalFooter))
        : Prisma.DbNull;
  const updateData = {
    ...(data.name ? { name: data.name.trim() } : {}),
    ...(globalHeader !== undefined ? { globalHeader } : {}),
    ...(globalFooter !== undefined ? { globalFooter } : {}),
  };
  const updated = data.slug
    ? await updateSiteWithUniqueSlug(data.slug, siteId, (slug) =>
        prisma.site.update({ where: { id: siteId }, data: { ...updateData, slug } }),
      )
    : await prisma.site.update({ where: { id: siteId }, data: updateData });

  revalidateSitePaths(
    [site.slug, updated.slug],
    site.pages.map((page) => page.slug),
  );

  return NextResponse.json(toSiteSummary(updated));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await params;
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user.id },
    select: { id: true, slug: true, pages: { select: { slug: true } } },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  await prisma.site.delete({ where: { id: siteId } });
  revalidateSitePaths(
    [site.slug],
    site.pages.map((page) => page.slug),
  );

  return NextResponse.json({ ok: true });
}
