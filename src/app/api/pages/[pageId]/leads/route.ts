import { NextResponse } from "next/server";
import { createLeadSubmission, parseLeadBody } from "@/lib/leads";
import { prisma } from "@/lib/prisma";

// Public endpoint: visitors on /p/[slug] submit lead forms here, so there is
// no auth. The page id is the only linkage; abuse is bounded by the body-size
// cap, the strict payload schema, and the honeypot field.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  const raw = await request.text();
  const parsed = parseLeadBody(raw);

  if (!parsed.ok) {
    if (parsed.reason === "too_large") {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    return NextResponse.json(
      { error: "Invalid payload", details: parsed.issues },
      { status: 422 },
    );
  }

  const page = await prisma.page.findFirst({
    where: { id: pageId },
    select: { id: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Honeypot tripped: pretend success without storing anything.
  if (parsed.value.website) {
    return NextResponse.json({ ok: true });
  }

  await createLeadSubmission(pageId, parsed.value.blockId, parsed.value.data);

  return NextResponse.json({ ok: true }, { status: 201 });
}
