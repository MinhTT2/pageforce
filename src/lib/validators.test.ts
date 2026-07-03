import { describe, expect, it } from "vitest";
import { createBlock, defaultPageSettings } from "./blocks";
import {
  legacyPageSchemaV1Validator,
  pagePatchValidator,
  pageSchemaValidator,
} from "./validators";
import type { BlockType } from "@/types/blocks";

const blockTypes: BlockType[] = [
  "hero",
  "text",
  "image",
  "button",
  "features",
  "testimonials",
  "pricing",
  "faq",
  "cta",
  "leadForm",
  "footer",
];

describe("pageSchemaValidator", () => {
  it("accepts a valid page schema", () => {
    const result = pageSchemaValidator.safeParse({
      version: 2,
      settings: defaultPageSettings,
      blocks: blockTypes.map(createBlock),
    });

    expect(result.success).toBe(true);
  });

  it("rejects a block with missing props", () => {
    const result = pageSchemaValidator.safeParse({
      version: 2,
      blocks: [{ id: "block-1", type: "hero", props: { heading: "Only heading" } }],
    });

    expect(result.success).toBe(false);
  });

  it("accepts per-block style overrides", () => {
    const result = pageSchemaValidator.safeParse({
      version: 2,
      blocks: [
        {
          ...createBlock("text"),
          style: {
            backgroundColor: "#0f172a",
            textColor: "#fff",
            align: "center",
            paddingY: "lg",
            width: "wide",
          },
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects non-hex colors to guard against CSS injection", () => {
    const result = pageSchemaValidator.safeParse({
      version: 2,
      blocks: [
        {
          ...createBlock("text"),
          style: { backgroundColor: "red; background:url(https://evil.example)" },
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("accepts partial design tokens", () => {
    const result = pageSchemaValidator.safeParse({
      version: 2,
      settings: {
        metaTitle: "",
        metaDescription: "",
        tokens: { primaryColor: "#2563eb", headingFont: "playfair" },
      },
      blocks: [],
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid token colors", () => {
    const result = pageSchemaValidator.safeParse({
      version: 2,
      settings: {
        metaTitle: "",
        metaDescription: "",
        tokens: { primaryColor: "blue" },
      },
      blocks: [],
    });

    expect(result.success).toBe(false);
  });
});

describe("legacyPageSchemaV1Validator", () => {
  it("accepts a v1 schema with theme settings", () => {
    const result = legacyPageSchemaV1Validator.safeParse({
      version: 1,
      settings: { metaTitle: "", metaDescription: "", theme: "warm" },
      blocks: [createBlock("text")],
    });

    expect(result.success).toBe(true);
  });
});

describe("pagePatchValidator", () => {
  it("accepts an editable page patch", () => {
    const result = pagePatchValidator.safeParse({
      title: "Landing page",
      slug: "landing-page",
      schema: { version: 2, blocks: [createBlock("text")] },
    });

    expect(result.success).toBe(true);
  });

  it("rejects client-sent status updates", () => {
    const result = pagePatchValidator.safeParse({ status: "PUBLISHED" });

    expect(result.success).toBe(false);
  });
});
