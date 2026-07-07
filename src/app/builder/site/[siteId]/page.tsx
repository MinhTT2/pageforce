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
    select: {
      id: true,
      name: true,
      slug: true,
      globalHeader: true,
      globalFooter: true,
      updatedAt: true,
      pages: {
        select: {
          id: true,
          siteId: true,
          title: true,
          slug: true,
          isHome: true,
          headerMode: true,
          footerMode: true,
          status: true,
          updatedAt: true,
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
  const activePage = await prisma.page.findFirst({
    where: { id: initialPage.id, siteId: site.id },
    select: {
      id: true,
      siteId: true,
      title: true,
      slug: true,
      isHome: true,
      headerMode: true,
      footerMode: true,
      status: true,
      updatedAt: true,
      schema: true,
    },
  });

  if (!activePage) {
    notFound();
  }

  const sitePages = site.pages.map((page) => ({
    ...page,
    site: { name: site.name, slug: site.slug },
  }));

  return (
    <BuilderShell
      page={toEditablePage({
        ...activePage,
        site: {
          ...site,
          pages: sitePages,
        },
      })}
    />
  );
}
