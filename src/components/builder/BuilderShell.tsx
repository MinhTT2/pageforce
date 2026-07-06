"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { blockLabels, createBlock, defaultPageSettings } from "@/lib/blocks";
import { builderReducer, initialBuilderState } from "@/lib/builder-state";
import { getPageTemplate, pageTemplates, type PageTemplateKey } from "@/lib/templates";
import { cn } from "@/lib/utils";
import type { BlockType, DesignTokens, PageBlock, PageSchema, PageSettings, SectionMode } from "@/types/blocks";
import type { EditablePage } from "@/types/page";
import { BlockPalette, PaletteDragPreview } from "./BlockPalette";
import { BuilderCanvas, type DropIndicator } from "./BuilderCanvas";
import { BuilderHeader } from "./BuilderHeader";
import { BuilderPageNavigator } from "./BuilderPageNavigator";
import { BuilderPageSettingsSidebar } from "./BuilderPageSettingsSidebar";
import { blockOptions } from "./block-meta";
import { Inspector } from "./Inspector";
import {
  usePublicOrigin,
  useSaveShortcut,
  useUndoRedoShortcuts,
  useUnsavedChangesWarning,
} from "./hooks";

type ActiveDrag =
  | { source: "palette"; blockType: BlockType }
  | { source: "canvas"; block: PageBlock }
  | null;

type SaveResponse = EditablePage & { error?: string };

// Pointer drags only drop where the pointer actually is (drag out = cancel);
// keyboard drags have no pointer, so they fall back to closest-center. Block
// hits outrank the canvas-root droppable, which contains everything.
const collisionDetection: CollisionDetection = (args) => {
  if (!args.pointerCoordinates) {
    return closestCenter(args);
  }

  const collisions = pointerWithin(args);

  return collisions.sort((a, b) => Number(a.id === "canvas") - Number(b.id === "canvas"));
};

function sameIndicator(a: DropIndicator, b: DropIndicator): boolean {
  if (a === b) {
    return true;
  }

  if (typeof a !== "object" || typeof b !== "object" || !a || !b) {
    return false;
  }

  return a.blockId === b.blockId && a.edge === b.edge;
}

export function BuilderShell({ page }: { page: EditablePage }) {
  const [state, dispatch] = useReducer(builderReducer, page, initialBuilderState);
  const [activePage, setActivePage] = useState(page);
  const [previewMode, setPreviewMode] = useState(false);
  const [leftMode, setLeftMode] = useState<"blocks" | "pages" | "pageSettings">("blocks");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator>(null);
  const [sitePages, setSitePages] = useState(page.site.pages);
  const [switchingPageId, setSwitchingPageId] = useState<string | null>(null);
  const publicOrigin = usePublicOrigin();

  const settings = state.schema.settings ?? defaultPageSettings;
  const publicUrl = useMemo(
    () => {
      const path = state.isHome ? `/s/${activePage.site.slug}` : `/s/${activePage.site.slug}/${state.slug}`;
      return publicOrigin ? `${publicOrigin}${path}` : path;
    },
    [activePage.site.slug, publicOrigin, state.isHome, state.slug],
  );
  const selectedBlock = useMemo(
    () => state.schema.blocks.find((block) => block.id === state.selectedBlockId) ?? null,
    [state.schema.blocks, state.selectedBlockId],
  );
  const starterTemplates = useMemo(
    () => pageTemplates.filter((template) => template.key !== "blank"),
    [],
  );
  const isLive =
    state.status === "PUBLISHED" &&
    state.schema.blocks.length > 0 &&
    !state.dirty &&
    state.saveStatus !== "error";

  const blockIdsRef = useRef<string[]>([]);
  const pageIdRef = useRef(page.id);
  const lastAutosavedVersionRef = useRef(0);
  const switchRequestIdRef = useRef(0);

  useEffect(() => {
    if (pageIdRef.current === page.id) {
      return;
    }

    pageIdRef.current = page.id;
    setActivePage(page);
    dispatch({ type: "loadPage", page });
    setSitePages(page.site.pages);
    setActiveDrag(null);
    setDropIndicator(null);
    setSwitchingPageId(null);
  }, [page]);

  useEffect(() => {
    blockIdsRef.current = state.schema.blocks.map((block) => block.id);
  }, [state.schema.blocks]);

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  // Step exactly one list position per arrow press; the stock sortable getter
  // jumps to the nearest rect, which skips items when section heights differ.
  const keyboardCoordinates = useCallback<KeyboardCoordinateGetter>(
    (event, { context: { active, droppableRects, collisionRect } }) => {
      if (!active || !collisionRect) {
        return undefined;
      }

      if (event.code !== "ArrowUp" && event.code !== "ArrowDown") {
        return undefined;
      }

      const ids = blockIdsRef.current;

      if (!ids.includes(String(active.id))) {
        return undefined;
      }

      // Current virtual position = the block whose rect center is nearest to
      // the dragged rect (collisionRect moves with every keyboard step).
      const centerY = collisionRect.top + collisionRect.height / 2;
      let currentIndex = -1;
      let bestDistance = Infinity;

      ids.forEach((id, index) => {
        const rect = droppableRects.get(id);

        if (!rect) {
          return;
        }

        const distance = Math.abs(rect.top + rect.height / 2 - centerY);

        if (distance < bestDistance) {
          bestDistance = distance;
          currentIndex = index;
        }
      });

      if (currentIndex < 0) {
        return undefined;
      }

      const nextIndex = event.code === "ArrowUp" ? currentIndex - 1 : currentIndex + 1;
      const rect = droppableRects.get(ids[nextIndex]);

      if (!rect) {
        return undefined;
      }

      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    },
    [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates }),
  );

  const savePage = useCallback(async () => {
    const current = stateRef.current;
    const currentPageId = pageIdRef.current;

    if (!current.dirty || current.saveStatus === "saving") {
      return;
    }

    const requestedSlug = current.slug;
    const editVersion = current.editVersion;
    dispatch({ type: "saveStarted" });

    try {
      const response = await fetch(`/api/pages/${currentPageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: current.title,
          slug: current.slug,
          isHome: current.isHome,
          headerMode: current.headerMode,
          footerMode: current.footerMode,
          headerSchema: current.headerSchema,
          footerSchema: current.footerSchema,
          schema: current.schema,
          lastKnownUpdatedAt: current.updatedAt,
        }),
      });
      const payload = (await response.json().catch(() => null)) as SaveResponse | null;

      if (response.ok && payload) {
        dispatch({ type: "saveSucceeded", page: payload, requestedSlug, editVersion });
        setActivePage(payload);
        setSitePages(payload.site.pages);
      } else {
        dispatch({
          type: "saveFailed",
          message: payload?.error ?? "Could not save page",
          editVersion,
        });
      }
    } catch {
      dispatch({ type: "saveFailed", message: "Could not save page", editVersion });
    }
  }, []);

  const switchPage = useCallback(async (pageId: string) => {
    if (pageId === pageIdRef.current || switchingPageId) {
      return;
    }

    if (
      stateRef.current.dirty &&
      !window.confirm("You have unsaved changes. Switch pages anyway?")
    ) {
      return;
    }

    const requestId = switchRequestIdRef.current + 1;
    switchRequestIdRef.current = requestId;
    setSwitchingPageId(pageId);

    try {
      const response = await fetch(`/api/pages/${pageId}`);
      const payload = (await response.json().catch(() => null)) as SaveResponse | null;

      if (switchRequestIdRef.current !== requestId) {
        return;
      }

      if (!response.ok || !payload || payload.error) {
        dispatch({
          type: "saveFailed",
          message: payload?.error ?? "Could not open page",
          editVersion: stateRef.current.editVersion,
        });
        return;
      }

      pageIdRef.current = payload.id;
      setActivePage(payload);
      dispatch({ type: "loadPage", page: payload });
      setSitePages(payload.site.pages);
      setActiveDrag(null);
      setDropIndicator(null);
      lastAutosavedVersionRef.current = 0;
      window.history.pushState(null, "", `/builder/site/${payload.site.id}?page=${payload.id}`);
    } catch {
      if (switchRequestIdRef.current === requestId) {
        dispatch({
          type: "saveFailed",
          message: "Could not open page",
          editVersion: stateRef.current.editVersion,
        });
      }
    } finally {
      if (switchRequestIdRef.current === requestId) {
        setSwitchingPageId(null);
      }
    }
  }, [switchingPageId]);

  const addBlock = useCallback((type: BlockType, index?: number) => {
    const blocks = stateRef.current.schema.blocks;
    const selectedId = stateRef.current.selectedBlockId;
    const selectedIndex = blocks.findIndex((block) => block.id === selectedId);
    const resolvedIndex =
      typeof index === "number" ? index : selectedIndex >= 0 ? selectedIndex + 1 : blocks.length;

    dispatch({ type: "insertBlock", block: createBlock(type), index: resolvedIndex });
  }, []);
  const applyTemplate = useCallback((key: PageTemplateKey) => {
    const template = getPageTemplate(key);

    if (!template) {
      return;
    }

    dispatch({ type: "replaceSchema", schema: template.build() });
  }, []);

  const selectBlock = useCallback((id: string) => dispatch({ type: "selectBlock", id }), []);
  const duplicateBlock = useCallback(
    (id: string) => dispatch({ type: "duplicateBlock", id, newId: crypto.randomUUID() }),
    [],
  );
  const deleteBlock = useCallback((id: string) => dispatch({ type: "deleteBlock", id }), []);
  const updateBlock = useCallback(
    (block: PageBlock) => dispatch({ type: "updateBlock", block, at: Date.now() }),
    [],
  );
  const clearSelection = useCallback(() => dispatch({ type: "selectBlock", id: null }), []);
  const setSlug = useCallback((value: string) => dispatch({ type: "setSlug", value, at: Date.now() }), []);
  const setIsHome = useCallback((value: boolean) => dispatch({ type: "setIsHome", value, at: Date.now() }), []);
  const setHeaderMode = useCallback(
    (value: SectionMode) => dispatch({ type: "setHeaderMode", value, at: Date.now() }),
    [],
  );
  const setFooterMode = useCallback(
    (value: SectionMode) => dispatch({ type: "setFooterMode", value, at: Date.now() }),
    [],
  );
  const setHeaderSchema = useCallback(
    (schema: PageSchema | null) => dispatch({ type: "setHeaderSchema", schema, at: Date.now() }),
    [],
  );
  const setFooterSchema = useCallback(
    (schema: PageSchema | null) => dispatch({ type: "setFooterSchema", schema, at: Date.now() }),
    [],
  );
  const updateSettings = useCallback(
    (patch: Partial<Omit<PageSettings, "tokens">>) =>
      dispatch({ type: "updateSettings", patch, at: Date.now() }),
    [],
  );
  const updateTokens = useCallback(
    (patch: Partial<DesignTokens>) => dispatch({ type: "updateTokens", patch, at: Date.now() }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const moveBlockBy = useCallback((id: string, delta: number) => {
    const blocks = stateRef.current.schema.blocks;
    const from = blocks.findIndex((block) => block.id === id);

    if (from < 0) {
      return;
    }

    dispatch({ type: "moveBlock", from, to: from + delta });
  }, []);
  const togglePreview = useCallback(() => setPreviewMode((current) => !current), []);
  const showBlocks = useCallback(() => {
    setLeftMode("blocks");
    setLeftSidebarOpen(true);
  }, []);
  const togglePages = useCallback(
    () => {
      setLeftSidebarOpen(true);
      setLeftMode((current) => (current === "pages" ? "blocks" : "pages"));
    },
    [],
  );
  const togglePageSettings = useCallback(
    () => {
      setLeftSidebarOpen(true);
      setLeftMode((current) => (current === "pageSettings" ? "blocks" : "pageSettings"));
    },
    [],
  );
  const toggleRightSidebar = useCallback(() => setRightSidebarOpen((current) => !current), []);

  useEffect(() => {
    if (
      !state.dirty ||
      state.saveStatus === "saving" ||
      state.editVersion === lastAutosavedVersionRef.current
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastAutosavedVersionRef.current = stateRef.current.editVersion;
      void savePage();
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [savePage, state.dirty, state.editVersion, state.saveStatus]);

  useSaveShortcut(savePage);
  useUndoRedoShortcuts(undo, redo);
  useUnsavedChangesWarning(state.dirty);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as
      | { source: "palette"; blockType: BlockType }
      | { source: "canvas" }
      | undefined;

    if (data?.source === "palette") {
      setActiveDrag({ source: "palette", blockType: data.blockType });
      return;
    }

    const block = state.schema.blocks.find((item) => item.id === event.active.id);

    if (block) {
      setActiveDrag({ source: "canvas", block });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    if (activeDrag?.source !== "palette") {
      return;
    }

    const over = event.over;
    let next: DropIndicator = null;

    if (over && over.id === "canvas") {
      next = "canvas-end";
    } else if (over) {
      const translated = event.active.rect.current.translated;
      const activeCenter = translated ? translated.top + translated.height / 2 : null;
      const edge =
        activeCenter !== null && activeCenter > over.rect.top + over.rect.height / 2
          ? "bottom"
          : "top";

      next = { blockId: String(over.id), edge };
    }

    // onDragOver fires on every pointer move; returning the previous reference
    // lets React bail out instead of re-rendering the whole canvas per move.
    setDropIndicator((current) => (sameIndicator(current, next) ? current : next));
  }

  function handleDragEnd(event: DragEndEvent) {
    if (activeDrag?.source === "palette" && dropIndicator) {
      let index = state.schema.blocks.length;

      if (dropIndicator !== "canvas-end") {
        const overIndex = state.schema.blocks.findIndex(
          (block) => block.id === dropIndicator.blockId,
        );

        if (overIndex >= 0) {
          index = overIndex + (dropIndicator.edge === "bottom" ? 1 : 0);
        }
      }

      addBlock(activeDrag.blockType, index);
    }

    if (activeDrag?.source === "canvas" && event.over && event.active.id !== event.over.id) {
      const from = state.schema.blocks.findIndex((block) => block.id === event.active.id);
      const to = state.schema.blocks.findIndex((block) => block.id === event.over?.id);

      if (from >= 0 && to >= 0) {
        dispatch({ type: "moveBlock", from, to });
      }
    }

    setActiveDrag(null);
    setDropIndicator(null);
  }

  function handleDragCancel() {
    setActiveDrag(null);
    setDropIndicator(null);
  }

  const announcements = useMemo(
    () => buildAnnouncements(state.schema.blocks),
    [state.schema.blocks],
  );

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-canvas text-canvas-foreground">
        <BuilderHeader
          dirty={state.dirty}
          saveStatus={state.saveStatus}
          notice={state.notice}
          previewMode={previewMode}
          blocksOpen={leftMode === "blocks"}
          pagesOpen={leftMode === "pages"}
          pageSettingsOpen={leftMode === "pageSettings"}
          rightSidebarOpen={rightSidebarOpen}
          canUndo={state.past.length > 0}
          canRedo={state.future.length > 0}
          onUndo={undo}
          onRedo={redo}
          onShowBlocks={showBlocks}
          onTogglePages={togglePages}
          onTogglePageSettings={togglePageSettings}
          onToggleRightSidebar={toggleRightSidebar}
          onTogglePreview={togglePreview}
          onSave={savePage}
        />
        {previewMode ? (
          <main className="min-h-0 flex-1 overflow-auto bg-[radial-gradient(circle_at_top,var(--surface)_0%,var(--canvas)_55%)] p-6">
            <div className="mx-auto mb-3 flex max-w-5xl items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
              <span>
                Preview mode shows the unsaved canvas. Open the public URL to view the live page.
              </span>
              <span className="rounded-md bg-surface px-2 py-1 font-medium text-surface-foreground">
                Preview
              </span>
            </div>
            <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-border bg-white shadow-lg shadow-primary/5">
              <BlockRenderer
                schema={composePreviewSchema({
                  pageSchema: state.schema,
                  siteHeader: activePage.site.globalHeader,
                  siteFooter: activePage.site.globalFooter,
                  pageHeader: state.headerSchema,
                  pageFooter: state.footerSchema,
                  headerMode: state.headerMode,
                  footerMode: state.footerMode,
                })}
              />
            </div>
          </main>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            accessibility={{ announcements }}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <main
              className={cn(
                "grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:overflow-hidden",
                leftSidebarOpen &&
                  rightSidebarOpen &&
                  "lg:grid-cols-[360px_minmax(0,1fr)_340px]",
                leftSidebarOpen &&
                  !rightSidebarOpen &&
                  "lg:grid-cols-[360px_minmax(0,1fr)]",
                !leftSidebarOpen && rightSidebarOpen && "lg:grid-cols-[minmax(0,1fr)_340px]",
                !leftSidebarOpen && !rightSidebarOpen && "lg:grid-cols-1",
              )}
            >
              {leftSidebarOpen && leftMode === "pageSettings" ? (
                <BuilderPageSettingsSidebar
                  siteId={activePage.site.id}
                  siteGlobalHeader={activePage.site.globalHeader}
                  siteGlobalFooter={activePage.site.globalFooter}
                  settings={settings}
                  slug={state.slug}
                  isHome={state.isHome}
                  headerMode={state.headerMode}
                  footerMode={state.footerMode}
                  headerSchema={state.headerSchema}
                  footerSchema={state.footerSchema}
                  publicUrl={publicUrl}
                  isLive={isLive}
                  onSlugChange={setSlug}
                  onIsHomeChange={setIsHome}
                  onHeaderModeChange={setHeaderMode}
                  onFooterModeChange={setFooterMode}
                  onHeaderSchemaChange={setHeaderSchema}
                  onFooterSchemaChange={setFooterSchema}
                  onSettingsChange={updateSettings}
                  onTokensChange={updateTokens}
                />
              ) : leftSidebarOpen && leftMode === "pages" ? (
                <BuilderPageNavigator
                  siteId={activePage.site.id}
                  pages={sitePages}
                  currentPageId={activePage.id}
                  switchingPageId={switchingPageId}
                  onSelectPage={switchPage}
                  onClose={() => setLeftMode("blocks")}
                />
              ) : leftSidebarOpen ? (
                <aside className="min-h-0 overflow-auto border-r border-border bg-card">
                  <BlockPalette onAdd={addBlock} />
                </aside>
              ) : null}
              <BuilderCanvas
                schema={state.schema}
                selectedBlockId={state.selectedBlockId}
                dropIndicator={dropIndicator}
                isPaletteDragging={activeDrag?.source === "palette"}
                templates={starterTemplates}
                onSelectBlock={selectBlock}
                onDuplicateBlock={duplicateBlock}
                onDeleteBlock={deleteBlock}
                onMoveBlock={moveBlockBy}
                onAddBlock={addBlock}
                onApplyTemplate={applyTemplate}
              />
              {rightSidebarOpen ? (
                <Inspector
                  selectedBlock={selectedBlock}
                  pageId={activePage.id}
                  settings={settings}
                  onUpdateBlock={updateBlock}
                  onDuplicateBlock={duplicateBlock}
                  onDeleteBlock={deleteBlock}
                  onClearSelection={clearSelection}
                  onClose={() => setRightSidebarOpen(false)}
                />
              ) : null}
            </main>
            <DragOverlay>
              {activeDrag?.source === "palette" ? (
                <PaletteDragPreview type={activeDrag.blockType} />
              ) : activeDrag?.source === "canvas" ? (
                <CanvasDragPreview block={activeDrag.block} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </TooltipProvider>
  );
}

function CanvasDragPreview({ block }: { block: PageBlock }) {
  const Icon = blockOptions[block.type].icon;

  return (
    <div className="flex w-fit items-center gap-2 rounded-lg border border-primary/40 bg-card px-3 py-2 text-sm font-semibold text-card-foreground shadow-lg">
      <span className="flex size-7 items-center justify-center rounded-md bg-background text-primary">
        <Icon className="size-4" />
      </span>
      {blockLabels[block.type]}
    </div>
  );
}

function composePreviewSchema({
  pageSchema,
  siteHeader,
  siteFooter,
  pageHeader,
  pageFooter,
  headerMode,
  footerMode,
}: {
  pageSchema: PageSchema;
  siteHeader: PageSchema | null;
  siteFooter: PageSchema | null;
  pageHeader: PageSchema | null;
  pageFooter: PageSchema | null;
  headerMode: SectionMode;
  footerMode: SectionMode;
}): PageSchema {
  const headerBlocks =
    headerMode === "HIDDEN" ? [] : headerMode === "CUSTOM" ? pageHeader?.blocks ?? [] : siteHeader?.blocks ?? [];
  const footerBlocks =
    footerMode === "HIDDEN" ? [] : footerMode === "CUSTOM" ? pageFooter?.blocks ?? [] : siteFooter?.blocks ?? [];

  return {
    ...pageSchema,
    blocks: [...headerBlocks, ...pageSchema.blocks, ...footerBlocks],
  };
}

function buildAnnouncements(blocks: PageBlock[]): Announcements {
  function describe(id: string | number) {
    if (String(id).startsWith("palette:")) {
      const type = String(id).replace("palette:", "") as BlockType;
      return `new ${blockLabels[type]} block`;
    }

    const index = blocks.findIndex((block) => block.id === id);

    if (index < 0) {
      return "block";
    }

    return `${blockLabels[blocks[index].type]} block, position ${index + 1} of ${blocks.length}`;
  }

  return {
    onDragStart({ active }) {
      return `Picked up ${describe(active.id)}.`;
    },
    onDragOver({ active, over }) {
      if (over) {
        return `${describe(active.id)} is over ${describe(over.id)}.`;
      }

      return `${describe(active.id)} is no longer over a drop area.`;
    },
    onDragEnd({ active, over }) {
      if (over) {
        return `Dropped ${describe(active.id)} over ${describe(over.id)}.`;
      }

      return `Dropped ${describe(active.id)}.`;
    },
    onDragCancel({ active }) {
      return `Dragging ${describe(active.id)} was cancelled.`;
    },
  };
}
