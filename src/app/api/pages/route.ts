import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPageForUser, listPagesForUser, toPageSummary } from "@/lib/pages";

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

  const body = await request.json().catch(() => ({}));
  const title =
    typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Untitled page";
  const page = await createPageForUser(user.id, title);

  return NextResponse.json(toPageSummary(page), { status: 201 });
}
