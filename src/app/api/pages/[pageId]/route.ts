import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createUniqueSlug, schemaToJson, toEditablePage } from "@/lib/pages";
import { prisma } from "@/lib/prisma";
import { pagePatchValidator } from "@/lib/validators";

export async function GET(
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
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(toEditablePage(page));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = pagePatchValidator.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  const page = await prisma.page.findFirst({
    where: { id: pageId, userId: user.id },
    select: { id: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const data = parsed.data;
  const updated = await prisma.page.update({
    where: { id: pageId },
    data: {
      ...(data.title ? { title: data.title } : {}),
      ...(data.slug ? { slug: await createUniqueSlug(data.slug, pageId) } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.schema ? { schema: schemaToJson(data.schema) } : {}),
    },
  });

  return NextResponse.json(toEditablePage(updated));
}

export async function DELETE(
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
    select: { id: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  await prisma.page.delete({ where: { id: pageId } });

  return NextResponse.json({ ok: true });
}
