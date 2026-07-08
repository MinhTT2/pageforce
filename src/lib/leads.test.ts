import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLeadSubmission,
  isLeadSubmissionFlooded,
  listLeadsForSite,
  MAX_LEAD_BODY_BYTES,
  MAX_LEAD_SUBMISSIONS_PER_MINUTE,
  parseLeadBody,
  toLeadSummary,
} from "./leads";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    leadSubmission: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const leadCreate = vi.mocked(prisma.leadSubmission.create);
const leadFindMany = vi.mocked(prisma.leadSubmission.findMany);
const leadCount = vi.mocked(prisma.leadSubmission.count);

beforeEach(() => {
  vi.restoreAllMocks();
  leadCreate.mockReset();
  leadFindMany.mockReset();
  leadCount.mockReset();
});

describe("parseLeadBody", () => {
  it("accepts a valid submission body", () => {
    const result = parseLeadBody(
      JSON.stringify({
        blockId: "block-1",
        website: "",
        data: { name: "Minh", email: "minh@example.com", message: "Hello" },
      }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.blockId).toBe("block-1");
      expect(result.value.data.email).toBe("minh@example.com");
    }
  });

  it("rejects an oversized body before parsing", () => {
    const raw = JSON.stringify({
      blockId: "block-1",
      data: { message: "x".repeat(MAX_LEAD_BODY_BYTES) },
    });

    const result = parseLeadBody(raw);

    expect(result).toEqual({ ok: false, reason: "too_large" });
  });

  it("rejects invalid JSON", () => {
    const result = parseLeadBody("not json");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("invalid");
    }
  });

  it("rejects payloads that fail validation with issue details", () => {
    const result = parseLeadBody(JSON.stringify({ blockId: "block-1", data: {} }));

    expect(result.ok).toBe(false);
    if (!result.ok && result.reason === "invalid") {
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });
});

describe("toLeadSummary", () => {
  it("keeps only known fields and formats the date as ISO", () => {
    const summary = toLeadSummary({
      id: "lead-1",
      blockId: "block-1",
      data: { name: "Minh", email: "minh@example.com", injected: "nope", message: "" },
      createdAt: new Date("2026-07-03T10:00:00Z"),
    });

    expect(summary).toEqual({
      id: "lead-1",
      blockId: "block-1",
      data: { name: "Minh", email: "minh@example.com" },
      createdAt: "2026-07-03T10:00:00.000Z",
    });
  });

  it("handles non-object stored data defensively", () => {
    const summary = toLeadSummary({
      id: "lead-2",
      blockId: "block-1",
      data: "corrupted",
      createdAt: new Date("2026-07-03T10:00:00Z"),
    });

    expect(summary.data).toEqual({});
  });
});

describe("lead persistence", () => {
  it("stores submissions against the site id", async () => {
    leadCreate.mockResolvedValue({
      id: "lead-1",
      siteId: "site-1",
      blockId: "block-1",
      data: { email: "minh@example.com" },
      createdAt: new Date("2026-07-03T10:00:00Z"),
    });

    await createLeadSubmission("site-1", "block-1", { email: "minh@example.com" });

    expect(leadCreate).toHaveBeenCalledWith({
      data: {
        siteId: "site-1",
        blockId: "block-1",
        data: { email: "minh@example.com" },
      },
    });
  });

  it("lists submissions by site id", async () => {
    leadFindMany.mockResolvedValue([]);

    await listLeadsForSite("site-1");

    expect(leadFindMany).toHaveBeenCalledWith({
      where: { siteId: "site-1" },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  });
});

describe("isLeadSubmissionFlooded", () => {
  it("counts recent submissions for the site within a sliding window", async () => {
    leadCount.mockResolvedValue(0);

    await expect(isLeadSubmissionFlooded("site-1")).resolves.toBe(false);

    expect(leadCount).toHaveBeenCalledWith({
      where: {
        siteId: "site-1",
        createdAt: { gte: expect.any(Date) },
      },
    });
  });

  it("reports flooding at the per-minute threshold", async () => {
    leadCount.mockResolvedValue(MAX_LEAD_SUBMISSIONS_PER_MINUTE);

    await expect(isLeadSubmissionFlooded("site-1")).resolves.toBe(true);
  });
});
