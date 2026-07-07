import { Prisma, PageStatus, type SectionMode as PrismaSectionMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fallbackSlug, slugify } from "@/lib/slug";
import { emptyPageSchema, normalizePageSchema } from "@/lib/blocks";
import type { CreatedSiteSummary, EditablePage, PageSummary, SiteSummary } from "@/types/page";
import type { PageSchema, SectionMode } from "@/types/blocks";

export const MAX_PAGE_BODY_BYTES = 512 * 1024;
export const MAX_SLUG_LENGTH = 64;
const MAX_UNIQUE_SLUG_ATTEMPTS = 25;
const RESERVED_SLUGS = new Set(["api", "dashboard", "builder", "login", "register", "s", "p"]);
type PageSlugClient = Pick<typeof prisma, "page">;

function toAppSectionMode(mode: PrismaSectionMode): SectionMode {
  return mode as SectionMode;
}

export function pagePublicationData(schema: PageSchema) {
  const publishable = schema.blocks.length > 0;

  return {
    status: publishable ? ("PUBLISHED" as const) : ("DRAFT" as const),
  };
}

export function toPageSummary(page: {
  id: string;
  siteId: string;
  site: { name: string; slug: string };
  title: string;
  slug: string;
  isHome: boolean;
  headerMode: PrismaSectionMode;
  footerMode: PrismaSectionMode;
  status: PageStatus;
  updatedAt: Date;
}): PageSummary {
  return {
    id: page.id,
    siteId: page.siteId,
    siteName: page.site.name,
    siteSlug: page.site.slug,
    title: page.title,
    slug: page.slug,
    publicPath: pagePublicPath(page.site.slug, page.slug, page.isHome),
    isHome: page.isHome,
    headerMode: toAppSectionMode(page.headerMode),
    footerMode: toAppSectionMode(page.footerMode),
    status: page.status,
    updatedAt: page.updatedAt.toISOString(),
  };
}

export function toEditablePage(page: {
  id: string;
  siteId: string;
  site: {
    id: string;
    name: string;
    slug: string;
    globalHeader: Prisma.JsonValue | null;
    globalFooter: Prisma.JsonValue | null;
    updatedAt: Date;
    pages?: Array<{
      id: string;
      siteId: string;
      site: { name: string; slug: string };
      title: string;
      slug: string;
      isHome: boolean;
      headerMode: PrismaSectionMode;
      footerMode: PrismaSectionMode;
      status: PageStatus;
      updatedAt: Date;
    }>;
  };
  title: string;
  slug: string;
  isHome: boolean;
  headerMode: PrismaSectionMode;
  footerMode: PrismaSectionMode;
  status: PageStatus;
  updatedAt: Date;
  schema: Prisma.JsonValue;
}): EditablePage {
  return {
    ...toPageSummary(page),
    schema: normalizePageSchema(page.schema),
    site: {
      id: page.site.id,
      name: page.site.name,
      slug: page.site.slug,
      updatedAt: page.site.updatedAt.toISOString(),
      globalHeader: page.site.globalHeader ? normalizePageSchema(page.site.globalHeader) : null,
      globalFooter: page.site.globalFooter ? normalizePageSchema(page.site.globalFooter) : null,
      pages: (page.site.pages ?? []).map(toPageSummary),
    },
  };
}

export function toSiteSummary(site: {
  id: string;
  name: string;
  slug: string;
  updatedAt: Date;
}): SiteSummary {
  return {
    id: site.id,
    name: site.name,
    slug: site.slug,
    updatedAt: site.updatedAt.toISOString(),
  };
}

export function toCreatedSiteSummary(site: {
  id: string;
  name: string;
  slug: string;
  updatedAt: Date;
  pages: Array<{
    id: string;
    slug: string;
    isHome: boolean;
  }>;
}): CreatedSiteSummary {
  const homePage = site.pages.find((page) => page.isHome) ?? site.pages[0];

  if (!homePage) {
    throw new Error("Created site has no pages");
  }

  return {
    ...toSiteSummary(site),
    homePageId: homePage.id,
    publicPath: pagePublicPath(site.slug, homePage.slug, homePage.isHome),
  };
}

function pagePublicPath(siteSlug: string, pageSlug: string, isHome: boolean) {
  return isHome ? `/s/${siteSlug}` : `/s/${siteSlug}/${pageSlug}`;
}

export async function listSitesForUser(userId: string, take = 50) {
  return prisma.site.findMany({
    where: { userId },
    include: {
      pages: {
        select: {
          id: true,
          title: true,
          slug: true,
          isHome: true,
          status: true,
          schema: true,
          updatedAt: true,
        },
        orderBy: [{ isHome: "desc" }, { updatedAt: "desc" }],
      },
    },
    orderBy: { updatedAt: "desc" },
    take,
  });
}

export async function listDashboardSitesForUser(userId: string, take = 50) {
  return prisma.site.findMany({
    where: { userId },
    include: {
      pages: {
        where: { isHome: true },
        select: {
          id: true,
          title: true,
          slug: true,
          isHome: true,
          status: true,
          schema: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take,
  });
}

export async function listPagesForUser(userId: string, siteId?: string, take = 50) {
  return prisma.page.findMany({
    where: { site: { is: { userId } }, ...(siteId ? { siteId } : {}) },
    include: { site: { select: { name: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
    take,
  });
}

export async function createPageForUser(
  userId: string,
  title = "Untitled page",
  schema: PageSchema = emptyPageSchema,
  siteId?: string,
) {
  const site = siteId
    ? await prisma.site.findFirst({ where: { id: siteId, userId }, select: { id: true } })
    : await getOrCreateDefaultSiteForUser(userId);

  if (!site) {
    throw new Error("Site not found");
  }

  const existingCount = await prisma.page.count({ where: { siteId: site.id } });
  const isHome = existingCount === 0;
  const publication = pagePublicationData(schema);

  return writeWithUniqueSlug(fallbackSlug(title), site.id, undefined, (slug) => {
    return prisma.page.create({
      data: {
        siteId: site.id,
        title,
        slug,
        isHome,
        status: publication.status,
        schema: schemaToJson(schema),
      },
      include: { site: { select: { name: true, slug: true } } },
    });
  });
}

async function createSiteForUser(userId: string, name = "Untitled site") {
  const site = await writeWithUniqueSiteSlug(fallbackSlug(name), undefined, (slug) =>
    prisma.site.create({
      data: {
        userId,
        name,
        slug,
      },
    }),
  );

  await createPageForUser(userId, "Home", emptyPageSchema, site.id);

  return site;
}

export async function createSiteFromTemplateForUser(
  userId: string,
  name = "Untitled site",
  pages: Array<{ title: string; schema: PageSchema }>,
  options: {
    buildGlobalHeader?: (
      site: { slug: string },
      pages: Array<{ title: string; slug: string; isHome: boolean }>,
    ) => PageSchema;
  } = {},
) {
  const site = await writeWithUniqueSiteSlug(fallbackSlug(name), undefined, (slug) =>
    prisma.site.create({
      data: {
        userId,
        name,
        slug,
      },
    }),
  );

  const initialPages = pages.length ? pages : [{ title: "Home", schema: emptyPageSchema }];
  const createdPages: Array<{ id: string; title: string; slug: string; isHome: boolean }> = [];

  for (const page of initialPages) {
    const createdPage = await createPageForUser(
      userId,
      page.title.trim() || "Untitled page",
      page.schema,
      site.id,
    );
    createdPages.push({
      id: createdPage.id,
      title: createdPage.title,
      slug: createdPage.slug,
      isHome: createdPage.isHome,
    });
  }

  const globalHeader = options.buildGlobalHeader?.(site, createdPages);

  if (globalHeader) {
    await prisma.site.update({
      where: { id: site.id },
      data: { globalHeader: schemaToJson(globalHeader) },
    });
  }

  return { ...site, pages: createdPages };
}

async function getOrCreateDefaultSiteForUser(userId: string) {
  const existing = await prisma.site.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (existing) {
    return existing;
  }

  const site = await createSiteForUser(userId, "My Site");
  return { id: site.id };
}

export async function createUniqueSlug(
  base: string,
  currentPageId?: string,
  siteId?: string,
  client: PageSlugClient = prisma,
) {
  const cleanBase = normalizeSlugBase(base);
  let candidate = buildSlugCandidate(cleanBase);
  let suffix = 2;

  while (
    await client.page.findFirst({
      where: {
        slug: candidate,
        ...(siteId ? { siteId } : {}),
        ...(currentPageId ? { id: { not: currentPageId } } : {}),
      },
      select: { id: true },
    })
  ) {
    candidate = buildSlugCandidate(cleanBase, suffix);
    suffix += 1;
  }

  return candidate;
}

export async function updatePageWithUniqueSlug<T>(
  base: string,
  currentPageId: string,
  siteId: string,
  write: (slug: string) => Promise<T>,
  client: PageSlugClient = prisma,
) {
  return writeWithUniqueSlug(base, siteId, currentPageId, write, client);
}

export async function updateSiteWithUniqueSlug<T>(
  base: string,
  currentSiteId: string,
  write: (slug: string) => Promise<T>,
) {
  return writeWithUniqueSiteSlug(base, currentSiteId, write);
}

function normalizeSlugBase(base: string) {
  const clean = slugify(base) || fallbackSlug(base);
  const reservedSafe = RESERVED_SLUGS.has(clean) ? `${clean}-page` : clean;

  return reservedSafe.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, "") || "page";
}

function buildSlugCandidate(base: string, suffix?: number) {
  if (!suffix) {
    return base.slice(0, MAX_SLUG_LENGTH);
  }

  const suffixText = `-${suffix}`;
  const trimmedBase = base
    .slice(0, Math.max(1, MAX_SLUG_LENGTH - suffixText.length))
    .replace(/-+$/g, "");

  return `${trimmedBase || "page"}${suffixText}`;
}

async function writeWithUniqueSlug<T>(
  base: string,
  siteId: string,
  currentPageId: string | undefined,
  write: (slug: string) => Promise<T>,
  client: PageSlugClient = prisma,
) {
  const cleanBase = normalizeSlugBase(base);

  for (let attempt = 0; attempt < MAX_UNIQUE_SLUG_ATTEMPTS; attempt += 1) {
    const slug = await createUniqueSlug(
      buildSlugCandidate(cleanBase, attempt === 0 ? undefined : attempt + 1),
      currentPageId,
      siteId,
      client,
    );

    try {
      return await write(slug);
    } catch (error) {
      if (!isUniqueSlugConflict(error)) {
        throw error;
      }
    }
  }

  throw new Error("Could not allocate a unique slug");
}

async function writeWithUniqueSiteSlug<T>(
  base: string,
  currentSiteId: string | undefined,
  write: (slug: string) => Promise<T>,
) {
  const cleanBase = normalizeSlugBase(base);

  for (let attempt = 0; attempt < MAX_UNIQUE_SLUG_ATTEMPTS; attempt += 1) {
    const slug = buildSlugCandidate(cleanBase, attempt === 0 ? undefined : attempt + 1);

    if (
      await prisma.site.findFirst({
        where: { slug, ...(currentSiteId ? { id: { not: currentSiteId } } : {}) },
        select: { id: true },
      })
    ) {
      continue;
    }

    try {
      return await write(slug);
    } catch (error) {
      if (!isUniqueSlugConflict(error)) {
        throw error;
      }
    }
  }

  throw new Error("Could not allocate a unique site slug");
}

function isUniqueSlugConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;

  return Array.isArray(target) ? target.includes("slug") : target === "slug";
}

export function schemaToJson(schema: PageSchema): Prisma.InputJsonValue {
  return schema as unknown as Prisma.InputJsonValue;
}
