import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { emptyPageSchema } from "@/lib/blocks";
import { createPageForUser, listPagesForUser, MAX_PAGE_BODY_BYTES, toPageSummary } from "@/lib/pages";
import { readJsonBody } from "@/lib/request-body";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId") || undefined;
  const pages = await listPagesForUser(user.id, siteId);

  return NextResponse.json(pages.map(toPageSummary));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await readJsonBody(request, MAX_PAGE_BODY_BYTES);

  if (!json.ok) {
    return NextResponse.json({ error: json.error }, { status: json.status });
  }

  const body = json.value as Record<string, unknown>;
  const title =
    typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Untitled page";
  const siteId = typeof body.siteId === "string" && body.siteId ? body.siteId : undefined;
  const page = await createPageForUser(user.id, title, emptyPageSchema, siteId);

  return NextResponse.json(toPageSummary(page), { status: 201 });
}
