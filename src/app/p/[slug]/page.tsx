import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { normalizePageSchema } from "@/lib/blocks";
import { prisma } from "@/lib/prisma";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.page.findFirst({
    where: { slug, status: "PUBLISHED" },
  });

  if (!page || !page.publishedSchema) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <BlockRenderer schema={normalizePageSchema(page.publishedSchema)} />
    </main>
  );
}
