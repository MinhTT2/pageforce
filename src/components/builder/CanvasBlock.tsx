import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { blockLabels } from "@/lib/blocks";
import type { PageBlock } from "@/types/blocks";
import { cn } from "@/lib/utils";

export type DropEdge = "top" | "bottom" | null;

// Deliberately not memo()'d: `children` is a fresh element whenever
// BlockRenderer renders, so a shallow compare would never bail. That's fine —
// re-rendering this thin wrapper is cheap, and memo(RenderedBlock) skips the
// heavy block content when its `block` prop is unchanged.
export function CanvasBlock({
  block,
  selected,
  dropEdge,
  onSelect,
  onDuplicate,
  onDelete,
  onMove,
  index,
  count,
  children,
}: {
  block: PageBlock;
  selected: boolean;
  dropEdge: DropEdge;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, delta: number) => void;
  index: number;
  count: number;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, data: { source: "canvas" } });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group/canvas-block relative", isDragging && "z-10 opacity-40")}
    >
      {dropEdge === "top" ? <DropLine position="top" /> : null}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(block.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(block.id);
          }
        }}
        className={cn(
          "block w-full cursor-pointer text-left outline-offset-[-2px] hover:outline hover:outline-2 hover:outline-primary/30 [&_a]:pointer-events-none [&_button]:pointer-events-none [&_input]:pointer-events-none [&_textarea]:pointer-events-none",
          selected && "outline outline-2 outline-primary",
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "absolute right-3 top-3 z-20 flex items-center gap-1 rounded-md border border-border bg-card p-1 opacity-0 shadow-sm transition group-hover/canvas-block:opacity-100 focus-within:opacity-100",
          selected && "opacity-100",
        )}
      >
        <span className="px-1.5 text-xs font-medium text-muted-foreground">
          {blockLabels[block.type]}
        </span>
        <button
          type="button"
          aria-label={`Move ${blockLabels[block.type]} block up`}
          disabled={index <= 0}
          onClick={(event) => {
            event.stopPropagation();
            onMove(block.id, -1);
          }}
          className="flex size-7 items-center justify-center rounded text-muted-foreground transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp size={14} />
        </button>
        <button
          type="button"
          aria-label={`Move ${blockLabels[block.type]} block down`}
          disabled={index >= count - 1}
          onClick={(event) => {
            event.stopPropagation();
            onMove(block.id, 1);
          }}
          className="flex size-7 items-center justify-center rounded text-muted-foreground transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowDown size={14} />
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={setActivatorNodeRef}
              {...listeners}
              {...attributes}
              type="button"
              aria-label={`Reorder ${blockLabels[block.type]} block`}
              className="flex size-7 cursor-grab items-center justify-center rounded text-muted-foreground transition hover:bg-accent hover:text-accent-foreground active:cursor-grabbing"
            >
              <GripVertical size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Drag to reorder — Space to lift, arrows to move, Space to drop
          </TooltipContent>
        </Tooltip>
        <button
          type="button"
          aria-label={`Duplicate ${blockLabels[block.type]} block`}
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate(block.id);
          }}
          className="flex size-7 items-center justify-center rounded text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          aria-label={`Delete ${blockLabels[block.type]} block`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(block.id);
          }}
          className="flex size-7 items-center justify-center rounded text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {dropEdge === "bottom" ? <DropLine position="bottom" /> : null}
    </div>
  );
}

function DropLine({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 z-30 h-0.5 bg-primary",
        position === "top" ? "top-0" : "bottom-0",
      )}
    />
  );
}
