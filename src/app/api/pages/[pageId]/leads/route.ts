import { NextResponse } from "next/server";
import { normalizePageSchema } from "@/lib/blocks";
import { createLeadSubmission, parseLeadBody } from "@/lib/leads";
import { prisma } from "@/lib/prisma";

// Public endpoint: visitors on public /s routes submit lead forms here, so there is
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
    where: { id: pageId, status: "PUBLISHED" },
    select: { id: true, siteId: true, schema: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Honeypot tripped: pretend success without storing anything.
  if (parsed.value.website) {
    return NextResponse.json({ ok: true });
  }

  const schema = normalizePageSchema(page.schema);
  const acceptsLeads = schema.blocks.some(
    (block) => block.type === "leadForm" && block.id === parsed.value.blockId,
  );

  if (!acceptsLeads) {
    return NextResponse.json({ error: "Lead form not found" }, { status: 404 });
  }

  await createLeadSubmission(page.siteId, parsed.value.blockId, parsed.value.data);

  return NextResponse.json({ ok: true }, { status: 201 });
}
