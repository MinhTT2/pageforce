import { describe, expect, it } from "vitest";
import { builderReducer, initialBuilderState, type BuilderState } from "./builder-state";
import { createBlock, defaultPageSettings, defaultTokens } from "./blocks";
import type { PageBlock } from "@/types/blocks";
import type { EditablePage } from "@/types/page";

function makePage(blockCount = 3): EditablePage {
  return {
    id: "page-1",
    siteId: "site-1",
    siteName: "Demo Site",
    siteSlug: "demo",
    title: "Launch",
    slug: "launch",
    publicPath: "/s/demo/launch",
    isHome: false,
    headerMode: "INHERIT",
    footerMode: "INHERIT",
    status: "PUBLISHED",
    publishedAt: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
    schema: {
      version: 2,
      blocks: Array.from({ length: blockCount }, () => createBlock("text")),
      settings: defaultPageSettings,
    },
    site: {
      id: "site-1",
      name: "Demo Site",
      slug: "demo",
      updatedAt: "2026-01-01T00:00:00.000Z",
      globalHeader: null,
      globalFooter: null,
      pages: [],
    },
  };
}

function makeState(blockCount = 3): BuilderState {
  return initialBuilderState(makePage(blockCount));
}

describe("initialBuilderState", () => {
  it("selects the first block and starts clean", () => {
    const state = makeState();

    expect(state.pageId).toBe("page-1");
    expect(state.selectedBlockId).toBe(state.schema.blocks[0].id);
    expect(state.dirty).toBe(false);
    expect(state.editVersion).toBe(0);
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

  it("appends and selects the block when no index is given", () => {
    const state = makeState();
    const block = createBlock("cta");
    const next = builderReducer(state, { type: "insertBlock", block });

    expect(next.schema.blocks).toHaveLength(4);
    expect(next.schema.blocks.at(-1)?.id).toBe(block.id);
    expect(next.selectedBlockId).toBe(block.id);
  });

  it("replaces the schema from a starter template and selects the first block", () => {
    const state = makeState(0);
    const hero = createBlock("hero");
    const cta = createBlock("cta");
    const next = builderReducer(state, {
      type: "replaceSchema",
      schema: {
        version: 2,
        blocks: [hero, cta],
        settings: { ...defaultPageSettings, metaTitle: "Template" },
      },
    });

    expect(next.schema.blocks.map((block) => block.id)).toEqual([hero.id, cta.id]);
    expect(next.schema.settings?.metaTitle).toBe("Template");
    expect(next.selectedBlockId).toBe(hero.id);
    expect(next.dirty).toBe(true);
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

  // The builder memoizes rendered blocks by object identity, so updateBlock
  // must only replace the edited block.
  it("keeps untouched block references identical on updateBlock", () => {
    const state = makeState();
    const edited = { ...state.schema.blocks[1] };
    const next = builderReducer(state, { type: "updateBlock", block: edited, at: 0 });

    expect(next.schema.blocks[0]).toBe(state.schema.blocks[0]);
    expect(next.schema.blocks[1]).toBe(edited);
    expect(next.schema.blocks[2]).toBe(state.schema.blocks[2]);
  });
});

describe("settings and tokens", () => {
  it("merges settings patches over defaults", () => {
    const state = makeState();
    const next = builderReducer(state, {
      type: "updateSettings",
      patch: { metaTitle: "New title" },
      at: 0,
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
      at: 0,
    });

    expect(next.schema.settings?.tokens).toEqual({ ...defaultTokens, primaryColor: "#ff0000" });
  });

  it("keeps the blocks array reference on token edits", () => {
    const state = makeState();
    const next = builderReducer(state, {
      type: "updateTokens",
      patch: { primaryColor: "#ff0000" },
      at: 0,
    });

    expect(next.schema.blocks).toBe(state.schema.blocks);
  });
});

describe("undo and redo", () => {
  it("restores insert, delete, move, and title edits", () => {
    const state = makeState();
    const inserted = createBlock("hero");
    const afterInsert = builderReducer(state, { type: "insertBlock", block: inserted, index: 1 });
    const afterDelete = builderReducer(afterInsert, {
      type: "deleteBlock",
      id: afterInsert.schema.blocks[0].id,
    });
    const afterMove = builderReducer(afterDelete, { type: "moveBlock", from: 0, to: 2 });
    const renamed = builderReducer(afterMove, { type: "setTitle", value: "Renamed", at: 0 });

    const undoTitle = builderReducer(renamed, { type: "undo" });
    const undoMove = builderReducer(undoTitle, { type: "undo" });
    const undoDelete = builderReducer(undoMove, { type: "undo" });
    const undoInsert = builderReducer(undoDelete, { type: "undo" });

    expect(undoTitle.title).toBe(afterMove.title);
    expect(undoMove.schema.blocks.map((block) => block.id)).toEqual(
      afterDelete.schema.blocks.map((block) => block.id),
    );
    expect(undoDelete.schema.blocks.map((block) => block.id)).toEqual(
      afterInsert.schema.blocks.map((block) => block.id),
    );
    expect(undoInsert.schema.blocks.map((block) => block.id)).toEqual(
      state.schema.blocks.map((block) => block.id),
    );
    expect(undoInsert.dirty).toBe(true);
  });

  it("redoes an undone edit", () => {
    const state = makeState();
    const renamed = builderReducer(state, { type: "setTitle", value: "Renamed", at: 0 });
    const undone = builderReducer(renamed, { type: "undo" });
    const redone = builderReducer(undone, { type: "redo" });

    expect(redone.title).toBe("Renamed");
    expect(redone.future).toHaveLength(0);
    expect(redone.past).toHaveLength(1);
  });

  it("clears future when editing after undo", () => {
    const renamed = builderReducer(makeState(), { type: "setTitle", value: "Renamed", at: 0 });
    const undone = builderReducer(renamed, { type: "undo" });
    const edited = builderReducer(undone, { type: "setSlug", value: "new-page", at: 10 });

    expect(edited.future).toHaveLength(0);
    expect(builderReducer(edited, { type: "redo" })).toBe(edited);
  });

  it("coalesces rapid edits on the same target", () => {
    const state = makeState();
    const firstBlock = { ...state.schema.blocks[0], props: { content: "A", align: "left" } } as PageBlock;
    const secondBlock = { ...firstBlock, props: { content: "AB", align: "left" } } as PageBlock;
    const next = builderReducer(
      builderReducer(state, { type: "updateBlock", block: firstBlock, at: 0 }),
      { type: "updateBlock", block: secondBlock, at: 500 },
    );

    expect(next.past).toHaveLength(1);
  });

  it("does not coalesce slow edits or edits on different targets", () => {
    const state = makeState();
    const firstEdit = { ...state.schema.blocks[0], props: { content: "A", align: "left" } } as PageBlock;
    const secondEdit = { ...firstEdit, props: { content: "AB", align: "left" } } as PageBlock;
    const differentBlock = { ...state.schema.blocks[1], props: { content: "Other", align: "left" } } as PageBlock;

    const slow = builderReducer(
      builderReducer(state, { type: "updateBlock", block: firstEdit, at: 0 }),
      { type: "updateBlock", block: secondEdit, at: 1500 },
    );
    const different = builderReducer(slow, {
      type: "updateBlock",
      block: differentBlock,
      at: 1600,
    });

    expect(slow.past).toHaveLength(2);
    expect(different.past).toHaveLength(3);
  });

  it("keeps structural edits as separate history entries", () => {
    const state = makeState();
    const moved = builderReducer(state, { type: "moveBlock", from: 0, to: 2 });
    const movedBack = builderReducer(moved, { type: "moveBlock", from: 2, to: 0 });

    expect(movedBack.past).toHaveLength(2);
  });

  it("does not push history for select, save lifecycle, or out-of-bounds moves", () => {
    const state = makeState();
    const selected = builderReducer(state, { type: "selectBlock", id: state.schema.blocks[1].id });
    const saving = builderReducer(selected, { type: "saveStarted" });
    const moved = builderReducer(saving, { type: "moveBlock", from: 0, to: 9 });

    expect(moved.past).toHaveLength(0);
  });

  it("caps history at 50 entries", () => {
    let state = makeState();

    for (let index = 0; index < 60; index += 1) {
      state = builderReducer(state, {
        type: "setTitle",
        value: `Title ${index}`,
        at: index * 1500,
      });
    }

    expect(state.past).toHaveLength(50);
  });

  it("returns the same reference when undo has no past", () => {
    const state = makeState();

    expect(builderReducer(state, { type: "undo" })).toBe(state);
  });
});

describe("save lifecycle", () => {
  it("slugifies slug edits", () => {
    const next = builderReducer(makeState(), { type: "setSlug", value: "My Page!", at: 0 });

    expect(next.slug).toBe("my-page");
    expect(next.dirty).toBe(true);
  });

  it("selecting a block does not dirty the page", () => {
    const state = makeState();
    const next = builderReducer(state, { type: "selectBlock", id: state.schema.blocks[1].id });

    expect(next.dirty).toBe(false);
  });

  it("clears dirty and syncs server state on success", () => {
    const dirtyState = builderReducer(makeState(), { type: "setTitle", value: "Renamed", at: 0 });
    const saving = builderReducer(dirtyState, { type: "saveStarted" });
    const page = makePage();
    const next = builderReducer(saving, {
      type: "saveSucceeded",
      page,
      requestedSlug: page.slug,
      editVersion: saving.editVersion,
      pageId: saving.pageId,
    });

    expect(next.dirty).toBe(false);
    expect(next.saveStatus).toBe("saved");
    expect(next.title).toBe(page.title);
    expect(next.updatedAt).toBe(page.updatedAt);
    expect(next.notice).toBeNull();
  });

  it("syncs publication status from the server on success", () => {
    const page = {
      ...makePage(0),
      status: "DRAFT" as const,
      publishedAt: null,
    };
    const next = builderReducer(makeState(), {
      type: "saveSucceeded",
      page,
      requestedSlug: page.slug,
      editVersion: 0,
      pageId: "page-1",
    });

    expect(next.status).toBe("DRAFT");
    expect(next.publishedAt).toBeNull();
  });

  it("keeps a cleared selection after save", () => {
    const cleared = builderReducer(makeState(), { type: "selectBlock", id: null });
    const page = makePage();
    const next = builderReducer(cleared, {
      type: "saveSucceeded",
      page,
      requestedSlug: page.slug,
      editVersion: cleared.editVersion,
      pageId: cleared.pageId,
    });

    expect(next.selectedBlockId).toBeNull();
  });

  it("surfaces a notice when the server deduped the slug", () => {
    const page = { ...makePage(), slug: "launch-2" };
    const next = builderReducer(makeState(), {
      type: "saveSucceeded",
      page,
      requestedSlug: "launch",
      editVersion: 0,
      pageId: "page-1",
    });

    expect(next.slug).toBe("launch-2");
    expect(next.notice).toContain("/s/demo/launch");
  });

  it("keeps dirty and reports the error on failure", () => {
    const dirtyState = builderReducer(makeState(), { type: "setTitle", value: "Renamed", at: 0 });
    const next = builderReducer(dirtyState, {
      type: "saveFailed",
      message: "Could not save",
      editVersion: dirtyState.editVersion,
      pageId: dirtyState.pageId,
    });

    expect(next.dirty).toBe(true);
    expect(next.editVersion).toBe(dirtyState.editVersion);
    expect(next.saveStatus).toBe("error");
    expect(next.notice).toBe("Could not save");
  });

  it("increments editVersion for edits but not save lifecycle actions", () => {
    const state = makeState();
    const edited = builderReducer(state, { type: "setSlug", value: "New Page", at: 0 });
    const saving = builderReducer(edited, { type: "saveStarted" });
    const failed = builderReducer(saving, {
      type: "saveFailed",
      message: "Conflict",
      editVersion: saving.editVersion,
      pageId: saving.pageId,
    });

    expect(edited.editVersion).toBe(1);
    expect(saving.editVersion).toBe(1);
    expect(failed.editVersion).toBe(1);
  });

  it("ignores stale save responses after a newer edit", () => {
    const firstEdit = builderReducer(makeState(), { type: "setTitle", value: "First", at: 0 });
    const saving = builderReducer(firstEdit, { type: "saveStarted" });
    const secondEdit = builderReducer(saving, { type: "setTitle", value: "Second", at: 10 });
    const staleSuccess = builderReducer(secondEdit, {
      type: "saveSucceeded",
      page: { ...makePage(), title: "First" },
      requestedSlug: "launch",
      editVersion: firstEdit.editVersion,
      pageId: firstEdit.pageId,
    });
    const staleFailure = builderReducer(secondEdit, {
      type: "saveFailed",
      message: "Old conflict",
      editVersion: firstEdit.editVersion,
      pageId: firstEdit.pageId,
    });

    expect(staleSuccess.title).toBe("Second");
    expect(staleSuccess.dirty).toBe(true);
    expect(staleFailure.notice).toBeNull();
    expect(staleFailure.saveStatus).toBe("idle");
  });

  it("loads a different page as a clean isolated editor state", () => {
    const dirtyState = builderReducer(makeState(), { type: "setTitle", value: "Renamed", at: 0 });
    const selectedState = builderReducer(dirtyState, {
      type: "selectBlock",
      id: dirtyState.schema.blocks[1].id,
    });
    const nextPage = {
      ...makePage(2),
      id: "page-2",
      title: "Pricing",
      slug: "pricing",
      publicPath: "/s/demo/pricing",
    };
    const next = builderReducer(selectedState, { type: "loadPage", page: nextPage });

    expect(next.pageId).toBe("page-2");
    expect(next.title).toBe("Pricing");
    expect(next.slug).toBe("pricing");
    expect(next.selectedBlockId).toBe(nextPage.schema.blocks[0].id);
    expect(next.dirty).toBe(false);
    expect(next.past).toHaveLength(0);
    expect(next.future).toHaveLength(0);
    expect(next.editVersion).toBe(0);
  });

  it("ignores save responses for a previous page after loading another page", () => {
    const firstEdit = builderReducer(makeState(), { type: "setTitle", value: "First edit", at: 0 });
    const saving = builderReducer(firstEdit, { type: "saveStarted" });
    const secondPage = {
      ...makePage(1),
      id: "page-2",
      title: "Contact",
      slug: "contact",
      publicPath: "/s/demo/contact",
    };
    const loadedSecondPage = builderReducer(saving, { type: "loadPage", page: secondPage });
    const staleSuccess = builderReducer(loadedSecondPage, {
      type: "saveSucceeded",
      page: { ...makePage(), title: "Saved first page" },
      requestedSlug: "launch",
      editVersion: saving.editVersion,
      pageId: saving.pageId,
    });
    const staleFailure = builderReducer(loadedSecondPage, {
      type: "saveFailed",
      message: "Old page failed",
      editVersion: saving.editVersion,
      pageId: saving.pageId,
    });

    expect(staleSuccess).toBe(loadedSecondPage);
    expect(staleFailure).toBe(loadedSecondPage);
    expect(loadedSecondPage.pageId).toBe("page-2");
    expect(loadedSecondPage.title).toBe("Contact");
  });
});
