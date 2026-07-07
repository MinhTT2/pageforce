import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { createBlock } from "@/lib/blocks";
import { createLeadSubmission } from "@/lib/leads";
import { prisma } from "@/lib/prisma";
import type { LeadFormBlock, PageSchema } from "@/types/blocks";

const mocks = vi.hoisted(() => ({
  pageFindFirst: vi.fn(),
  createLeadSubmission: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    page: {
      findFirst: mocks.pageFindFirst,
    },
  },
}));

vi.mock("@/lib/leads", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/leads")>();

  return {
    ...actual,
    createLeadSubmission: mocks.createLeadSubmission,
  };
});

const pageFindFirst = vi.mocked(prisma.page.findFirst);
const createLead = vi.mocked(createLeadSubmission);

beforeEach(() => {
  vi.restoreAllMocks();
  mocks.pageFindFirst.mockReset();
  mocks.createLeadSubmission.mockReset();
});

function params(pageId = "page-1") {
  return { params: Promise.resolve({ pageId }) };
}

function leadRequest(body: unknown) {
  return new Request("http://pageforce.test/api/pages/page-1/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function pageWithSchema(schema: PageSchema) {
  pageFindFirst.mockResolvedValue({
    id: "page-1",
    siteId: "site-1",
    schema,
  } as unknown as Awaited<ReturnType<typeof pageFindFirst>>);
}

describe("POST /api/pages/[pageId]/leads", () => {
  it("stores submissions for published capture lead forms", async () => {
    const block = createBlock("leadForm") as LeadFormBlock;
    block.id = "lead-1";
    block.props.deliveryMode = "capture";
    pageWithSchema({ version: 2, blocks: [block] });

    const response = await POST(
      leadRequest({
        blockId: "lead-1",
        data: { name: "Minh", email: "minh@example.com", message: "Hello" },
      }),
      params(),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.status).toBe(201);
    expect(pageFindFirst).toHaveBeenCalledWith({
      where: { id: "page-1", status: "PUBLISHED" },
      select: { id: true, siteId: true, schema: true },
    });
    expect(createLead).toHaveBeenCalledWith("site-1", "lead-1", {
      name: "Minh",
      email: "minh@example.com",
      message: "Hello",
    });
  });

  it("rejects oversized payloads before querying the page", async () => {
    const response = await POST(
      leadRequest(JSON.stringify({ blockId: "lead-1", data: { message: "x".repeat(20_000) } })),
      params(),
    );

    await expect(response.json()).resolves.toEqual({ error: "Payload too large" });
    expect(response.status).toBe(413);
    expect(pageFindFirst).not.toHaveBeenCalled();
    expect(createLead).not.toHaveBeenCalled();
  });

  it("rejects invalid email addresses", async () => {
    const response = await POST(
      leadRequest({
        blockId: "lead-1",
        data: { email: "not-an-email" },
      }),
      params(),
    );

    const payload = await response.json();
    expect(response.status).toBe(422);
    expect(payload.error).toBe("Invalid payload");
    expect(payload.details).toContainEqual({
      path: "data.email",
      message: "Invalid email address",
    });
    expect(pageFindFirst).not.toHaveBeenCalled();
  });

  it("silently accepts honeypot submissions without storing", async () => {
    const block = createBlock("leadForm") as LeadFormBlock;
    block.id = "lead-1";
    block.props.deliveryMode = "capture";
    pageWithSchema({ version: 2, blocks: [block] });

    const response = await POST(
      leadRequest({
        blockId: "lead-1",
        website: "https://bot.example",
        data: { email: "bot@example.com" },
      }),
      params(),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.status).toBe(200);
    expect(createLead).not.toHaveBeenCalled();
  });

  it("rejects submissions for missing lead blocks", async () => {
    const block = createBlock("hero");
    block.id = "hero-1";
    pageWithSchema({ version: 2, blocks: [block] });

    const response = await POST(
      leadRequest({
        blockId: "lead-1",
        data: { email: "minh@example.com" },
      }),
      params(),
    );

    await expect(response.json()).resolves.toEqual({ error: "Lead form not found" });
    expect(response.status).toBe(404);
    expect(createLead).not.toHaveBeenCalled();
  });

  it("rejects submissions for non-capture lead forms", async () => {
    const block = createBlock("leadForm") as LeadFormBlock;
    block.id = "lead-1";
    block.props.deliveryMode = "mailto";
    pageWithSchema({ version: 2, blocks: [block] });

    const response = await POST(
      leadRequest({
        blockId: "lead-1",
        data: { email: "minh@example.com" },
      }),
      params(),
    );

    await expect(response.json()).resolves.toEqual({ error: "Lead form not found" });
    expect(response.status).toBe(404);
    expect(createLead).not.toHaveBeenCalled();
  });
});
