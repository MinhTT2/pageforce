import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { normalizePageSchema } from "@/lib/blocks";
import { schemaToJson, toEditablePage } from "@/lib/pages";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId } = await params;
  const page = await prisma.page.findFirst({
    where: { id: pageId, userId: user.id },
    select: { id: true, draftSchema: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const published = await prisma.page.update({
    where: { id: page.id },
    data: {
      status: "PUBLISHED",
      publishedSchema: schemaToJson(normalizePageSchema(page.draftSchema)),
      publishedAt: new Date(),
    },
  });

  return NextResponse.json(toEditablePage(published));
}
