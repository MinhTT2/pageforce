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
import type { BlockType, DesignTokens, PageBlock, PageSettings } from "@/types/blocks";
import type { EditablePage } from "@/types/page";
import { BlockPalette, PaletteDragPreview } from "./BlockPalette";
import { BuilderCanvas, type DropIndicator } from "./BuilderCanvas";
import { BuilderHeader } from "./BuilderHeader";
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
  const [previewMode, setPreviewMode] = useState(false);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator>(null);
  const publicOrigin = usePublicOrigin();

  const settings = state.schema.settings ?? defaultPageSettings;
  const publicUrl = useMemo(
    () => (publicOrigin ? `${publicOrigin}/p/${state.slug}` : `/p/${state.slug}`),
    [publicOrigin, state.slug],
  );
  const selectedBlock = useMemo(
    () => state.schema.blocks.find((block) => block.id === state.selectedBlockId) ?? null,
    [state.schema.blocks, state.selectedBlockId],
  );
  const starterTemplates = useMemo(
    () => pageTemplates.filter((template) => template.key !== "blank"),
    [],
  );

  const blockIdsRef = useRef<string[]>([]);

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

    if (!current.dirty || current.saveStatus === "saving") {
      return;
    }

    const requestedSlug = current.slug;
    dispatch({ type: "saveStarted" });

    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: current.title,
          slug: current.slug,
          schema: current.schema,
        }),
      });
      const payload = (await response.json().catch(() => null)) as SaveResponse | null;

      if (response.ok && payload) {
        dispatch({ type: "saveSucceeded", page: payload, requestedSlug });
      } else {
        dispatch({ type: "saveFailed", message: payload?.error ?? "Could not save page" });
      }
    } catch {
      dispatch({ type: "saveFailed", message: "Could not save page" });
    }
  }, [page.id]);

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
  const setTitle = useCallback((value: string) => dispatch({ type: "setTitle", value, at: Date.now() }), []);
  const setSlug = useCallback((value: string) => dispatch({ type: "setSlug", value, at: Date.now() }), []);
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
          title={state.title}
          dirty={state.dirty}
          saveStatus={state.saveStatus}
          notice={state.notice}
          previewMode={previewMode}
          publicUrl={publicUrl}
          onTitleChange={setTitle}
          canUndo={state.past.length > 0}
          canRedo={state.future.length > 0}
          onUndo={undo}
          onRedo={redo}
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
              <BlockRenderer schema={state.schema} />
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
            <main className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-[280px_minmax(0,1fr)_340px] lg:overflow-hidden">
              <BlockPalette onAdd={addBlock} />
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
              <Inspector
                selectedBlock={selectedBlock}
                pageId={page.id}
                settings={settings}
                slug={state.slug}
                publicUrl={publicUrl}
                onUpdateBlock={updateBlock}
                onDuplicateBlock={duplicateBlock}
                onDeleteBlock={deleteBlock}
                onClearSelection={clearSelection}
                onSlugChange={setSlug}
                onSettingsChange={updateSettings}
                onTokensChange={updateTokens}
              />
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
