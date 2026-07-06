import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { normalizePageSchema } from "@/lib/blocks";
import { prisma } from "@/lib/prisma";

type PublicPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

const getPublicPage = cache(async (slug: string) => {
  return prisma.page.findFirst({
    where: { slug, status: "PUBLISHED" },
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

  const backgroundColor = schema.settings?.tokens.backgroundColor ?? "#ffffff";

  return (
    <main className="min-h-screen" style={{ backgroundColor }}>
      <BlockRenderer schema={schema} pageId={page.id} />
    </main>
  );
}
