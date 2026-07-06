import { notFound } from "next/navigation";
import { BuilderShell } from "@/components/builder/BuilderShell";
import { requireUser } from "@/lib/auth";
import { toEditablePage } from "@/lib/pages";
import { prisma } from "@/lib/prisma";

export default async function SiteBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { siteId } = await params;
  const { page } = await searchParams;
  const requestedPageId = Array.isArray(page) ? page[0] : page;
  const user = await requireUser(`/builder/site/${siteId}`);
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user.id },
    include: {
      pages: {
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
        orderBy: [{ isHome: "desc" }, { updatedAt: "desc" }],
      },
    },
  });

  if (!site || !site.pages.length) {
    notFound();
  }

  const initialPage =
    site.pages.find((page) => page.id === requestedPageId) ??
    site.pages.find((page) => page.isHome) ??
    site.pages[0];

  return <BuilderShell page={toEditablePage(initialPage)} />;
}
