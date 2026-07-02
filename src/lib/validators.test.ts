import { describe, expect, it } from "vitest";
import { createBlock } from "./blocks";
import { pagePatchValidator, pageSchemaValidator } from "./validators";

describe("pageSchemaValidator", () => {
  it("accepts a valid page schema", () => {
    const result = pageSchemaValidator.safeParse({
      version: 1,
      blocks: [createBlock("hero"), createBlock("button")],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a block with missing props", () => {
    const result = pageSchemaValidator.safeParse({
      version: 1,
      blocks: [{ id: "block-1", type: "hero", props: { heading: "Only heading" } }],
    });

    expect(result.success).toBe(false);
  });
});

describe("pagePatchValidator", () => {
  it("accepts an editable page patch", () => {
    const result = pagePatchValidator.safeParse({
      title: "Landing page",
      slug: "landing-page",
      draftSchema: { version: 1, blocks: [createBlock("text")] },
    });

    expect(result.success).toBe(true);
  });

  it("rejects status updates outside the publish endpoint", () => {
    const result = pagePatchValidator.safeParse({ status: "PUBLISHED" });

    expect(result.success).toBe(false);
  });
});
