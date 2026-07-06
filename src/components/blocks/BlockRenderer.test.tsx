import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlockRenderer } from "./BlockRenderer";
import { createBlock, defaultPageSettings } from "@/lib/blocks";
import type { FooterBlock, HeaderBlock, PageSchema } from "@/types/blocks";

function headerSchema(): PageSchema {
  return {
    version: 2,
    blocks: [createBlock("header") as HeaderBlock],
    settings: defaultPageSettings,
  };
}

function footerSchema(): PageSchema {
  return {
    version: 2,
    blocks: [createBlock("footer") as FooterBlock],
    settings: defaultPageSettings,
  };
}

describe("BlockRenderer", () => {
  it("keeps sticky header positioning in live mode", () => {
    const { container } = render(<BlockRenderer schema={headerSchema()} />);
    const header = container.querySelector("header");

    expect(header?.className).toContain("sticky");
    expect(header?.className).toContain("top-0");
    expect(header?.className).toContain("z-30");
  });

  it("removes sticky header positioning in editor mode", () => {
    const { container } = render(<BlockRenderer schema={headerSchema()} renderMode="editor" />);
    const header = container.querySelector("header");

    expect(header?.className).not.toContain("sticky");
    expect(header?.className).not.toContain("top-0");
    expect(header?.className).not.toContain("z-30");
  });

  it("resolves root-relative public links inside the current site", () => {
    const schema = headerSchema();
    const header = schema.blocks[0] as HeaderBlock;
    header.props.links = [
      { label: "Hello", url: "/hello" },
      { label: "Pricing", url: "/s/demo/pricing" },
      { label: "External", url: "https://example.com" },
      { label: "Anchor", url: "#pricing" },
    ];
    header.props.ctaUrl = "/checkout";

    const { getByRole } = render(<BlockRenderer schema={schema} siteSlug="demo" />);

    expect(getByRole("link", { name: "Pageforce" }).getAttribute("href")).toBe("/s/demo");
    expect(getByRole("link", { name: "Hello" }).getAttribute("href")).toBe("/s/demo/hello");
    expect(getByRole("link", { name: "Pricing" }).getAttribute("href")).toBe("/s/demo/pricing");
    expect(getByRole("link", { name: "External" }).getAttribute("href")).toBe("https://example.com");
    expect(getByRole("link", { name: "Anchor" }).getAttribute("href")).toBe("#pricing");
    expect(getByRole("link", { name: /Buy now/i }).getAttribute("href")).toBe("/s/demo/checkout");
  });

  it("resolves root-relative footer links inside the current site", () => {
    const schema = footerSchema();
    const footer = schema.blocks[0] as FooterBlock;
    footer.props.links = [
      { label: "About", url: "/about" },
      { label: "Contact", url: "/s/demo/contact" },
      { label: "Docs", url: "https://example.com/docs" },
      { label: "Legal", url: "#legal" },
    ];

    const { getByRole } = render(<BlockRenderer schema={schema} siteSlug="demo" />);

    expect(getByRole("link", { name: "About" }).getAttribute("href")).toBe("/s/demo/about");
    expect(getByRole("link", { name: "Contact" }).getAttribute("href")).toBe("/s/demo/contact");
    expect(getByRole("link", { name: "Docs" }).getAttribute("href")).toBe("https://example.com/docs");
    expect(getByRole("link", { name: "Legal" }).getAttribute("href")).toBe("#legal");
  });
});
