import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { normalizePageSchema } from "@/lib/blocks";
import {
  MAX_PAGE_BODY_BYTES,
  pagePublicationData,
  schemaToJson,
  toEditablePage,
  updatePageWithUniqueSlug,
} from "@/lib/pages";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";
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
  const json = await readJsonBody(request, MAX_PAGE_BODY_BYTES);

  if (!json.ok) {
    return NextResponse.json({ error: json.error }, { status: json.status });
  }

  const parsed = pagePatchValidator.safeParse(json.value);

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
    select: { id: true, slug: true, updatedAt: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const data = parsed.data;

  if (data.lastKnownUpdatedAt && data.lastKnownUpdatedAt !== page.updatedAt.toISOString()) {
    return NextResponse.json(
      { error: "This page changed in another tab. Reload before saving again." },
      { status: 409 },
    );
  }

  const normalizedSchema = data.schema ? normalizePageSchema(data.schema) : null;
  const schema = normalizedSchema ? schemaToJson(normalizedSchema) : null;
  const publication = normalizedSchema ? pagePublicationData(normalizedSchema) : null;
  const updateData = {
    ...(data.title ? { title: data.title } : {}),
    ...(schema ? { draftSchema: schema } : {}),
    ...(publication
      ? {
          status: publication.status,
          publishedSchema: publication.publishedSchema,
          publishedAt: publication.publishedAt,
        }
      : {}),
  };
  const updated = data.slug
    ? await updatePageWithUniqueSlug(data.slug, pageId, (slug) =>
        prisma.page.update({
          where: { id: pageId },
          data: { ...updateData, slug },
        }),
      )
    : await prisma.page.update({
        where: { id: pageId },
        data: updateData,
      });

  revalidatePath(`/p/${page.slug}`);
  revalidatePath(`/p/${updated.slug}`);

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
    select: { id: true, slug: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  await prisma.page.delete({ where: { id: pageId } });
  revalidatePath(`/p/${page.slug}`);

  return NextResponse.json({ ok: true });
}
