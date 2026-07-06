import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { normalizePageSchema } from "@/lib/blocks";
import { pagePublicPath } from "@/lib/pages";
import { prisma } from "@/lib/prisma";

type PublicPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

const getPublicPage = cache(async (slug: string) => {
  return prisma.page.findFirst({
    where: {
      status: "PUBLISHED",
      OR: [{ legacySlug: slug }, { slug }],
    },
    include: { site: { select: { slug: true } } },
  });
});

export async function generateMetadata({ params }: PublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublicPage(slug);

  if (!page) {
    return {};
  }

  const schema = normalizePageSchema(page.draftSchema);
  if (schema.blocks.length === 0) {
    return {};
  }

  const title = schema.settings?.metaTitle || page.title;
  const description =
    schema.settings?.metaDescription || "A landing page built with Pageforce.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const page = await getPublicPage(slug);

  if (!page) {
    notFound();
  }

  const schema = normalizePageSchema(page.draftSchema);
  if (schema.blocks.length === 0) {
    notFound();
  }

  redirect(pagePublicPath(page.site.slug, page.slug, page.isHome));
}
