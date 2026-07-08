import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createSiteFromTemplateForUser,
  listSitesForUser,
  MAX_PAGE_BODY_BYTES,
  toCreatedSiteSummary,
  toSiteSummary,
} from "@/lib/pages";
import { readJsonBody } from "@/lib/request-body";
import { buildSiteHeaderSchema, resolveSiteTemplate } from "@/lib/templates";
import { siteCreateValidator } from "@/lib/validators";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sites = await listSitesForUser(user.id);

  return NextResponse.json(
    sites.map((site) => ({
      ...toSiteSummary(site),
      pages: site.pages.map((page) => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        isHome: page.isHome,
        status: page.status,
        updatedAt: page.updatedAt.toISOString(),
      })),
    })),
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await readJsonBody(request, MAX_PAGE_BODY_BYTES);

  if (!json.ok) {
    return NextResponse.json({ error: json.error }, { status: json.status });
  }

  const parsed = siteCreateValidator.safeParse(json.value);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const template = resolveSiteTemplate(parsed.data.template);
  const site = await createSiteFromTemplateForUser(
    user.id,
    parsed.data.name?.trim() || "Untitled site",
    template.pages.map((page) => ({
      title: page.title,
      schema: page.schema(),
    })),
    {
      buildGlobalHeader: (site, pages) =>
        buildSiteHeaderSchema({
          brandText: template.brandText,
          pages,
          siteSlug: site.slug,
        }),
    },
  );

  // A visitor may have 404-cached these URLs before the site existed.
  revalidatePath(`/s/${site.slug}`);
  for (const page of site.pages) {
    revalidatePath(`/s/${site.slug}/${page.slug}`);
  }

  return NextResponse.json(toCreatedSiteSummary(site), { status: 201 });
}
