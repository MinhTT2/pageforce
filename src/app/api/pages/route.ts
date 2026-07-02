import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreatePageForUser, getPageForUser, toPageSummary } from "@/lib/pages";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await getPageForUser(user.id);

  return NextResponse.json(page ? [toPageSummary(page)] : []);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { page, created } = await getOrCreatePageForUser(user.id, body.title);

  return NextResponse.json(toPageSummary(page), { status: created ? 201 : 200 });
}
