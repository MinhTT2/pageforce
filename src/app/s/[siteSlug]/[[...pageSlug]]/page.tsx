import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { SectionMode as PrismaSectionMode } from "@prisma/client";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { normalizePageSchema } from "@/lib/blocks";
import { prisma } from "@/lib/prisma";
import type { PageSchema, SectionMode } from "@/types/blocks";

type PublicSitePageProps = {
  params: Promise<{ siteSlug: string; pageSlug?: string[] }>;
};

export const dynamic = "force-dynamic";

function toAppSectionMode(mode: PrismaSectionMode): SectionMode {
  return mode as SectionMode;
}

const getPublicSitePage = cache(async (siteSlug: string, pageSlug?: string) => {
  const site = await prisma.site.findUnique({
    where: { slug: siteSlug },
    include: {
      pages: {
        where: {
          status: "PUBLISHED",
          ...(pageSlug ? { slug: pageSlug } : { isHome: true }),
        },
        take: 1,
      },
    },
  });

  if (!site) {
    return null;
  }

  const page = site.pages[0];

  if (!page) {
    return null;
  }

  return { site, page };
});

export async function generateMetadata({ params }: PublicSitePageProps): Promise<Metadata> {
  const { siteSlug, pageSlug } = await params;
  if (pageSlug && pageSlug.length > 1) {
    return {};
  }
  const resolved = await getPublicSitePage(siteSlug, pageSlug?.[0]);

  if (!resolved) {
    return {};
  }

  const schema = normalizePageSchema(resolved.page.schema);
  if (schema.blocks.length === 0) {
    return {};
  }

  const title = schema.settings?.metaTitle || resolved.page.title;
  const description =
    schema.settings?.metaDescription || `${resolved.site.name} built with Pageforce.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function PublicSitePage({ params }: PublicSitePageProps) {
  const { siteSlug, pageSlug } = await params;
  if (pageSlug && pageSlug.length > 1) {
    notFound();
  }
  const resolved = await getPublicSitePage(siteSlug, pageSlug?.[0]);

  if (!resolved) {
    notFound();
  }

  const pageSchema = normalizePageSchema(resolved.page.schema);
  if (pageSchema.blocks.length === 0) {
    notFound();
  }

  const schema = composePublicSchema({
    pageSchema,
    siteHeader: resolved.site.globalHeader ? normalizePageSchema(resolved.site.globalHeader) : null,
    siteFooter: resolved.site.globalFooter ? normalizePageSchema(resolved.site.globalFooter) : null,
    headerMode: toAppSectionMode(resolved.page.headerMode),
    footerMode: toAppSectionMode(resolved.page.footerMode),
  });
  const backgroundColor = pageSchema.settings?.tokens.backgroundColor ?? "#ffffff";

  return (
    <main className="min-h-screen" style={{ backgroundColor }}>
      <BlockRenderer schema={schema} pageId={resolved.page.id} siteSlug={resolved.site.slug} />
    </main>
  );
}

function composePublicSchema({
  pageSchema,
  siteHeader,
  siteFooter,
  headerMode,
  footerMode,
}: {
  pageSchema: PageSchema;
  siteHeader: PageSchema | null;
  siteFooter: PageSchema | null;
  headerMode: SectionMode;
  footerMode: SectionMode;
}): PageSchema {
  const headerBlocks = headerMode === "HIDDEN" ? [] : siteHeader?.blocks ?? [];
  const footerBlocks = footerMode === "HIDDEN" ? [] : siteFooter?.blocks ?? [];

  return {
    ...pageSchema,
    blocks: [...headerBlocks, ...pageSchema.blocks, ...footerBlocks],
  };
}
