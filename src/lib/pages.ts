import { Prisma, PageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fallbackSlug, slugify } from "@/lib/slug";
import { emptyPageSchema, normalizePageSchema } from "@/lib/blocks";
import type { EditablePage, PageSummary } from "@/types/page";
import type { PageSchema } from "@/types/blocks";

export function toPageSummary(page: {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  updatedAt: Date;
}): PageSummary {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: page.status,
    updatedAt: page.updatedAt.toISOString(),
  };
}

export function toEditablePage(page: {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  updatedAt: Date;
  schema: Prisma.JsonValue;
}): EditablePage {
  return {
    ...toPageSummary(page),
    schema: normalizePageSchema(page.schema),
  };
}

export async function createPageForUser(userId: string, title = "Untitled page") {
  const slug = await createUniqueSlug(fallbackSlug(title));

  return prisma.page.create({
    data: {
      userId,
      title,
      slug,
      schema: emptyPageSchema,
    },
  });
}

export async function createUniqueSlug(base: string, currentPageId?: string) {
  const cleanBase = slugify(base) || fallbackSlug(base);
  let candidate = cleanBase;
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
    candidate = `${cleanBase}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export function schemaToJson(schema: PageSchema): Prisma.InputJsonValue {
  return schema as unknown as Prisma.InputJsonValue;
}
