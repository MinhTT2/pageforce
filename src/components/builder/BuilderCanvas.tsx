import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { memo, useCallback, useMemo, type ReactNode } from "react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Button } from "@/components/ui/button";
import type { BlockType, PageBlock, PageSchema } from "@/types/blocks";
import { cn } from "@/lib/utils";
import { CanvasBlock } from "./CanvasBlock";

export type DropIndicator = { blockId: string; edge: "top" | "bottom" } | "canvas-end" | null;

export const BuilderCanvas = memo(function BuilderCanvas({
  schema,
  selectedBlockId,
  dropIndicator,
  isPaletteDragging,
  onSelectBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onAddBlock,
}: {
  schema: PageSchema;
  selectedBlockId: string | null;
  dropIndicator: DropIndicator;
  isPaletteDragging: boolean;
  onSelectBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: (type: BlockType) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  // Stable unless selection or the drop indicator actually changes — those are
  // exactly the renders memo(BlockRenderer) must let through.
  const renderBlockWrapper = useCallback(
    (block: PageBlock, children: ReactNode) => (
      <CanvasBlock
        block={block}
        selected={selectedBlockId === block.id}
        dropEdge={
          dropIndicator && dropIndicator !== "canvas-end" && dropIndicator.blockId === block.id
            ? dropIndicator.edge
            : null
        }
        onSelect={onSelectBlock}
        onDuplicate={onDuplicateBlock}
        onDelete={onDeleteBlock}
      >
        {children}
      </CanvasBlock>
    ),
    [selectedBlockId, dropIndicator, onSelectBlock, onDuplicateBlock, onDeleteBlock],
  );

  const emptyActions = useMemo(
    () => (
      <>
        <Button size="sm" onClick={() => onAddBlock("hero")}>
          Add Hero
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onAddBlock("features")}>
          Add Features
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onAddBlock("cta")}>
          Add CTA
        </Button>
      </>
    ),
    [onAddBlock],
  );

  return (
    <section className="overflow-auto bg-[radial-gradient(circle_at_top,var(--surface)_0%,var(--canvas)_55%)] p-6">
      <div
        ref={setNodeRef}
        className={cn(
          "mx-auto max-w-5xl overflow-hidden rounded-lg border border-border bg-white shadow-lg shadow-primary/5 transition",
          isPaletteDragging && "ring-2 ring-primary/30",
          isPaletteDragging && isOver && "ring-primary/70",
        )}
      >
        <SortableContext
          items={schema.blocks.map((block) => block.id)}
          strategy={verticalListSortingStrategy}
        >
          <BlockRenderer
            schema={schema}
            renderBlockWrapper={renderBlockWrapper}
            emptyActions={emptyActions}
          />
        </SortableContext>
        {dropIndicator === "canvas-end" && schema.blocks.length > 0 ? (
          <div className="h-0.5 bg-primary" />
        ) : null}
      </div>
    </section>
  );
});
