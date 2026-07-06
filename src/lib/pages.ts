import { Prisma, PageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fallbackSlug, slugify } from "@/lib/slug";
import { emptyPageSchema, normalizePageSchema } from "@/lib/blocks";
import type { EditablePage, PageSummary } from "@/types/page";
import type { PageSchema } from "@/types/blocks";

export const MAX_PAGE_BODY_BYTES = 512 * 1024;
export const MAX_SLUG_LENGTH = 64;
const MAX_UNIQUE_SLUG_ATTEMPTS = 25;
const RESERVED_SLUGS = new Set(["api", "dashboard", "builder", "login", "register"]);

export function pagePublicationData(schema: PageSchema) {
  const publishable = schema.blocks.length > 0;
  const publishedAt = publishable ? new Date() : null;

  return {
    status: publishable ? ("PUBLISHED" as const) : ("DRAFT" as const),
    publishedSchema: publishable ? schemaToJson(schema) : Prisma.DbNull,
    publishedAt,
  };
}

export function toPageSummary(page: {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  publishedAt: Date | null;
  updatedAt: Date;
}): PageSummary {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: page.status,
    publishedAt: page.publishedAt?.toISOString() ?? null,
    updatedAt: page.updatedAt.toISOString(),
  };
}

export function toEditablePage(page: {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  publishedAt: Date | null;
  updatedAt: Date;
  draftSchema: Prisma.JsonValue;
}): EditablePage {
  return {
    ...toPageSummary(page),
    schema: normalizePageSchema(page.draftSchema),
  };
}

export async function listPagesForUser(userId: string, take = 50) {
  return prisma.page.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take,
  });
}

export async function createPageForUser(
  userId: string,
  title = "Untitled page",
  schema: PageSchema = emptyPageSchema,
) {
  const publication = pagePublicationData(schema);

  return writeWithUniqueSlug(fallbackSlug(title), undefined, (slug) => {
    return prisma.page.create({
      data: {
        userId,
        title,
        slug,
        status: publication.status,
        draftSchema: schemaToJson(schema),
        publishedSchema: publication.publishedSchema,
        publishedAt: publication.publishedAt,
      },
    });
  });
}

export async function createUniqueSlug(base: string, currentPageId?: string) {
  const cleanBase = normalizeSlugBase(base);
  let candidate = buildSlugCandidate(cleanBase);
  let suffix = 2;

  while (
    await prisma.page.findFirst({
      where: {
        slug: candidate,
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
  write: (slug: string) => Promise<T>,
) {
  return writeWithUniqueSlug(base, currentPageId, write);
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
  currentPageId: string | undefined,
  write: (slug: string) => Promise<T>,
) {
  const cleanBase = normalizeSlugBase(base);

  for (let attempt = 0; attempt < MAX_UNIQUE_SLUG_ATTEMPTS; attempt += 1) {
    const slug = await createUniqueSlug(
      buildSlugCandidate(cleanBase, attempt === 0 ? undefined : attempt + 1),
      currentPageId,
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
