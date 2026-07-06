import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const user = await requireUser(`/builder/${pageId}`);
  const page = await prisma.page.findFirst({
    where: { id: pageId, site: { is: { userId: user.id } } },
    select: { id: true, siteId: true },
  });

  if (!page) {
    notFound();
  }

  redirect(`/builder/site/${page.siteId}?page=${page.id}`);
}
