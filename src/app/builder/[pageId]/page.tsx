import { notFound } from "next/navigation";
import { BuilderShell } from "@/components/builder/BuilderShell";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toEditablePage } from "@/lib/pages";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const user = await requireUser(`/builder/${pageId}`);
  const page = await prisma.page.findFirst({
    where: { id: pageId, userId: user.id },
  });

  if (!page) {
    notFound();
  }

  return <BuilderShell page={toEditablePage(page)} />;
}
