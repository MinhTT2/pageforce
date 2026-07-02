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
  const user = await requireUser();
  const { pageId } = await params;
  const page = await prisma.page.findFirst({
    where: { id: pageId, userId: user.id },
  });

  if (!page) {
    notFound();
  }

  return <BuilderShell page={toEditablePage(page)} />;
}
