import { describe, expect, it } from "vitest";
import { emptyPageSchema, tokenPresets } from "./blocks";
import { getPageTemplate, pageTemplates, resolveTemplateSchema } from "./templates";
import { pageSchemaValidator } from "./validators";

// Must match iconMap in src/components/blocks/BlockRenderer.tsx — unknown
// names silently render as Sparkles.
const rendererIcons = ["BadgeCheck", "Check", "Globe", "MessageCircle", "Sparkles", "Star", "Zap"];

const expectedTokens = {
  blank: tokenPresets.clean,
  "product-launch": tokenPresets.bold,
  event: tokenPresets.clean,
  "sales-promo": tokenPresets.warm,
} as const;

describe("pageTemplates", () => {
  it("has unique keys and includes blank first", () => {
    const keys = pageTemplates.map((template) => template.key);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys[0]).toBe("blank");
  });

  it.each(pageTemplates)("builds a valid schema for $key", (template) => {
    expect(pageSchemaValidator.safeParse(template.build()).success).toBe(true);
  });

  it.each(pageTemplates)("uses the expected token preset for $key", (template) => {
    expect(template.build().settings?.tokens).toEqual(expectedTokens[template.key]);
  });

  it("builds blank as an empty schema equal to emptyPageSchema", () => {
    expect(getPageTemplate("blank")?.build()).toEqual(emptyPageSchema);
  });

  it.each(pageTemplates)("generates unique block ids per build for $key", (template) => {
    const first = template.build().blocks.map((block) => block.id);
    const second = template.build().blocks.map((block) => block.id);

    expect(new Set(first).size).toBe(first.length);
    expect(first.filter((id) => second.includes(id))).toEqual([]);
  });

  it.each(pageTemplates)("only uses renderer-supported feature icons in $key", (template) => {
    for (const block of template.build().blocks) {
      if (block.type !== "features") continue;
      for (const item of block.props.items) {
        expect(rendererIcons).toContain(item.icon);
      }
    }
  });
});

describe("resolveTemplateSchema", () => {
  it("resolves known keys to non-empty schemas", () => {
    expect(resolveTemplateSchema("product-launch").blocks.length).toBeGreaterThan(0);
    expect(resolveTemplateSchema("event").blocks.length).toBeGreaterThan(0);
    expect(resolveTemplateSchema("sales-promo").blocks.length).toBeGreaterThan(0);
  });

  it.each(["nope", undefined, 42, null, {}])("falls back to blank for %s", (key) => {
    expect(resolveTemplateSchema(key)).toEqual(emptyPageSchema);
  });
});
