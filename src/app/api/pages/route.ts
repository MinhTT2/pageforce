import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPageForUser, toPageSummary } from "@/lib/pages";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await prisma.page.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(pages.map(toPageSummary));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const page = await createPageForUser(user.id, body.title);

  return NextResponse.json(toPageSummary(page), { status: 201 });
}
