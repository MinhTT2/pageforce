import { describe, expect, it } from "vitest";
import { builderReducer, initialBuilderState, type BuilderState } from "./builder-state";
import { createBlock, defaultPageSettings, defaultTokens } from "./blocks";
import type { EditablePage } from "@/types/page";

function makePage(blockCount = 3): EditablePage {
  return {
    id: "page-1",
    title: "Launch",
    slug: "launch",
    status: "PUBLISHED",
    publishedAt: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
    schema: {
      version: 2,
      blocks: Array.from({ length: blockCount }, () => createBlock("text")),
      settings: defaultPageSettings,
    },
  };
}

function makeState(blockCount = 3): BuilderState {
  return initialBuilderState(makePage(blockCount));
}

describe("initialBuilderState", () => {
  it("selects the first block and starts clean", () => {
    const state = makeState();

    expect(state.selectedBlockId).toBe(state.schema.blocks[0].id);
    expect(state.dirty).toBe(false);
    expect(state.saveStatus).toBe("idle");
  });

  it("fills missing settings with defaults", () => {
    const page = makePage();
    page.schema = { version: 2, blocks: [] };

    expect(initialBuilderState(page).schema.settings).toEqual(defaultPageSettings);
  });
});

describe("block mutations", () => {
  it("inserts a block at the given index and selects it", () => {
    const state = makeState();
    const block = createBlock("hero");
    const next = builderReducer(state, { type: "insertBlock", block, index: 1 });

    expect(next.schema.blocks[1].id).toBe(block.id);
    expect(next.selectedBlockId).toBe(block.id);
    expect(next.dirty).toBe(true);
  });

  it("clamps insert indexes to the block range", () => {
    const state = makeState();
    const block = createBlock("cta");
    const next = builderReducer(state, { type: "insertBlock", block, index: 99 });

    expect(next.schema.blocks.at(-1)?.id).toBe(block.id);
  });

  it("moves blocks between positions", () => {
    const state = makeState();
    const [first, second, third] = state.schema.blocks;
    const next = builderReducer(state, { type: "moveBlock", from: 0, to: 2 });

    expect(next.schema.blocks.map((block) => block.id)).toEqual([
      second.id,
      third.id,
      first.id,
    ]);
    expect(next.dirty).toBe(true);
  });

  it("ignores out-of-bounds moves", () => {
    const state = makeState();

    expect(builderReducer(state, { type: "moveBlock", from: 0, to: 5 })).toBe(state);
    expect(builderReducer(state, { type: "moveBlock", from: 1, to: 1 })).toBe(state);
  });

  it("duplicates a block right after the original with the new id", () => {
    const state = makeState();
    const target = state.schema.blocks[1];
    const next = builderReducer(state, {
      type: "duplicateBlock",
      id: target.id,
      newId: "copy-id",
    });

    expect(next.schema.blocks).toHaveLength(4);
    expect(next.schema.blocks[2]).toEqual({ ...target, id: "copy-id" });
    expect(next.selectedBlockId).toBe("copy-id");
  });

  it("re-picks the selection when the selected block is deleted", () => {
    const state = makeState();
    const next = builderReducer(state, { type: "deleteBlock", id: state.schema.blocks[0].id });

    expect(next.schema.blocks).toHaveLength(2);
    expect(next.selectedBlockId).toBe(next.schema.blocks[0].id);
  });

  it("keeps the selection when another block is deleted", () => {
    const state = makeState();
    const next = builderReducer(state, { type: "deleteBlock", id: state.schema.blocks[2].id });

    expect(next.selectedBlockId).toBe(state.selectedBlockId);
  });
});

describe("settings and tokens", () => {
  it("merges settings patches over defaults", () => {
    const state = makeState();
    const next = builderReducer(state, {
      type: "updateSettings",
      patch: { metaTitle: "New title" },
    });

    expect(next.schema.settings?.metaTitle).toBe("New title");
    expect(next.schema.settings?.tokens).toEqual(defaultTokens);
    expect(next.dirty).toBe(true);
  });

  it("merges token patches into existing tokens", () => {
    const state = makeState();
    const next = builderReducer(state, {
      type: "updateTokens",
      patch: { primaryColor: "#ff0000" },
    });

    expect(next.schema.settings?.tokens).toEqual({ ...defaultTokens, primaryColor: "#ff0000" });
  });
});

describe("save lifecycle", () => {
  it("slugifies slug edits", () => {
    const next = builderReducer(makeState(), { type: "setSlug", value: "My Page!" });

    expect(next.slug).toBe("my-page");
    expect(next.dirty).toBe(true);
  });

  it("selecting a block does not dirty the page", () => {
    const state = makeState();
    const next = builderReducer(state, { type: "selectBlock", id: state.schema.blocks[1].id });

    expect(next.dirty).toBe(false);
  });

  it("clears dirty and syncs server state on success", () => {
    const dirtyState = builderReducer(makeState(), { type: "setTitle", value: "Renamed" });
    const saving = builderReducer(dirtyState, { type: "saveStarted" });
    const page = makePage();
    const next = builderReducer(saving, {
      type: "saveSucceeded",
      page,
      requestedSlug: page.slug,
    });

    expect(next.dirty).toBe(false);
    expect(next.saveStatus).toBe("saved");
    expect(next.title).toBe(page.title);
    expect(next.notice).toBeNull();
  });

  it("keeps a cleared selection after save", () => {
    const cleared = builderReducer(makeState(), { type: "selectBlock", id: null });
    const page = makePage();
    const next = builderReducer(cleared, {
      type: "saveSucceeded",
      page,
      requestedSlug: page.slug,
    });

    expect(next.selectedBlockId).toBeNull();
  });

  it("surfaces a notice when the server deduped the slug", () => {
    const page = { ...makePage(), slug: "launch-2" };
    const next = builderReducer(makeState(), {
      type: "saveSucceeded",
      page,
      requestedSlug: "launch",
    });

    expect(next.slug).toBe("launch-2");
    expect(next.notice).toContain("/p/launch-2");
  });

  it("keeps dirty and reports the error on failure", () => {
    const dirtyState = builderReducer(makeState(), { type: "setTitle", value: "Renamed" });
    const next = builderReducer(dirtyState, { type: "saveFailed", message: "Could not save" });

    expect(next.dirty).toBe(true);
    expect(next.saveStatus).toBe("error");
    expect(next.notice).toBe("Could not save");
  });
});
