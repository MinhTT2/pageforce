import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ExternalLink } from "lucide-react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Button } from "@/components/ui/button";
import type { BlockType, PageSchema } from "@/types/blocks";
import { cn } from "@/lib/utils";
import { CanvasBlock } from "./CanvasBlock";

export type DropIndicator = { blockId: string; edge: "top" | "bottom" } | "canvas-end" | null;

export function BuilderCanvas({
  schema,
  selectedBlockId,
  dropIndicator,
  isPaletteDragging,
  publicUrl,
  onSelectBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onAddBlock,
}: {
  schema: PageSchema;
  selectedBlockId: string | null;
  dropIndicator: DropIndicator;
  isPaletteDragging: boolean;
  publicUrl: string;
  onSelectBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: (type: BlockType) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  return (
    <section className="overflow-auto bg-[radial-gradient(circle_at_top,var(--surface)_0%,var(--canvas)_55%)] p-6">
      <div className="mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Live preview
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Public page canvas</h2>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={publicUrl} target="_blank" rel="noreferrer">
            <ExternalLink />
            Open public URL
          </a>
        </Button>
      </div>
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
            renderBlockWrapper={(block, children) => (
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
            )}
            emptyActions={
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
            }
          />
        </SortableContext>
        {dropIndicator === "canvas-end" && schema.blocks.length > 0 ? (
          <div className="h-0.5 bg-primary" />
        ) : null}
      </div>
    </section>
  );
}
