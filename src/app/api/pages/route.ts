import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPageForUser, listPagesForUser, MAX_PAGE_BODY_BYTES, toPageSummary } from "@/lib/pages";
import { readJsonBody } from "@/lib/request-body";
import { resolveTemplateSchema } from "@/lib/templates";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await listPagesForUser(user.id);

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
  const schema = resolveTemplateSchema(body.template);
  const page = await createPageForUser(user.id, title, schema);

  return NextResponse.json(toPageSummary(page), { status: 201 });
}
