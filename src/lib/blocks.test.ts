import { describe, expect, it } from "vitest";
import {
  blockLabels,
  createBlock,
  defaultPageSettings,
  defaultTokens,
  emptyPageSchema,
  normalizePageSchema,
  tokenPresets,
} from "./blocks";
import { pageSchemaValidator } from "./validators";
import type { BlockType, PageSchema } from "@/types/blocks";

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

describe("block defaults", () => {
  it("has labels for every block type", () => {
    expect(Object.keys(blockLabels).sort()).toEqual([...blockTypes].sort());
  });

  it.each(blockTypes)("creates a valid %s block", (type) => {
    const schema: PageSchema = {
      version: 2,
      blocks: [createBlock(type)],
    };

    expect(pageSchemaValidator.safeParse(schema).success).toBe(true);
  });
});

describe("normalizePageSchema", () => {
  it("returns valid schemas unchanged", () => {
    const schema: PageSchema = {
      version: 2,
      blocks: [createBlock("text")],
      settings: defaultPageSettings,
    };

    expect(normalizePageSchema(schema)).toEqual(schema);
  });

  it("fills default settings and tokens on sparse v2 schemas", () => {
    const schema = {
      version: 2,
      blocks: [createBlock("text")],
    };

    expect(normalizePageSchema(schema)).toEqual({ ...schema, settings: defaultPageSettings });
  });

  it("fills missing token fields on partial v2 tokens", () => {
    const schema = {
      version: 2,
      blocks: [],
      settings: {
        metaTitle: "Launch",
        metaDescription: "",
        tokens: { primaryColor: "#ff0000" },
      },
    };

    expect(normalizePageSchema(schema).settings?.tokens).toEqual({
      ...defaultTokens,
      primaryColor: "#ff0000",
    });
  });

  it("keeps per-block style overrides", () => {
    const block = { ...createBlock("text"), style: { backgroundColor: "#123456" } };
    const schema = { version: 2, blocks: [block] };

    expect(normalizePageSchema(schema).blocks[0]).toEqual(block);
  });

  it("migrates v1 schemas with a theme to the matching token preset", () => {
    const schema = {
      version: 1,
      blocks: [createBlock("text")],
      settings: { metaTitle: "Launch", metaDescription: "Desc", theme: "bold" },
    };

    expect(normalizePageSchema(schema)).toEqual({
      version: 2,
      blocks: schema.blocks,
      settings: {
        metaTitle: "Launch",
        metaDescription: "Desc",
        tokens: tokenPresets.bold,
      },
    });
  });

  it("migrates v1 schemas without settings to clean defaults", () => {
    const schema = {
      version: 1,
      blocks: [createBlock("hero")],
    };

    expect(normalizePageSchema(schema)).toEqual({
      version: 2,
      blocks: schema.blocks,
      settings: defaultPageSettings,
    });
  });

  it("falls back for malformed schemas", () => {
    expect(normalizePageSchema({ version: 2, blocks: [{ type: "unknown" }] })).toEqual(
      emptyPageSchema,
    );
  });

  it("falls back for unsupported schema versions", () => {
    expect(normalizePageSchema({ version: 3, blocks: [] })).toEqual(emptyPageSchema);
  });
});
