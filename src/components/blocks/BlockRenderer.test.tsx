import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlockRenderer } from "./BlockRenderer";
import { createBlock, defaultPageSettings } from "@/lib/blocks";
import type { HeaderBlock, PageSchema } from "@/types/blocks";

function headerSchema(): PageSchema {
  return {
    version: 2,
    blocks: [createBlock("header") as HeaderBlock],
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
});
