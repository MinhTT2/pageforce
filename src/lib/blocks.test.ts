import { describe, expect, it } from "vitest";
import { blockLabels, createBlock, emptyPageSchema, normalizePageSchema } from "./blocks";
import { pageSchemaValidator } from "./validators";
import type { BlockType, PageSchema } from "@/types/blocks";

const blockTypes: BlockType[] = ["hero", "text", "image", "button"];

describe("block defaults", () => {
  it("has labels for every block type", () => {
    expect(Object.keys(blockLabels).sort()).toEqual([...blockTypes].sort());
  });

  it.each(blockTypes)("creates a valid %s block", (type) => {
    const schema: PageSchema = {
      version: 1,
      blocks: [createBlock(type)],
    };

    expect(pageSchemaValidator.safeParse(schema).success).toBe(true);
  });
});

describe("normalizePageSchema", () => {
  it("returns valid schemas unchanged", () => {
    const schema: PageSchema = {
      version: 1,
      blocks: [createBlock("text")],
    };

    expect(normalizePageSchema(schema)).toEqual(schema);
  });

  it("falls back for malformed schemas", () => {
    expect(normalizePageSchema({ version: 1, blocks: [{ type: "unknown" }] })).toEqual(
      emptyPageSchema,
    );
  });

  it("falls back for unsupported schema versions", () => {
    expect(normalizePageSchema({ version: 2, blocks: [] })).toEqual(emptyPageSchema);
  });
});
