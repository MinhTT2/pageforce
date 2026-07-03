import { describe, expect, it } from "vitest";
import { MAX_LEAD_BODY_BYTES, parseLeadBody, toLeadSummary } from "./leads";

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
