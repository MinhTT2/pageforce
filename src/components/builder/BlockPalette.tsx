import { useDraggable } from "@dnd-kit/core";
import { blockLabels } from "@/lib/blocks";
import type { BlockType } from "@/types/blocks";
import { cn } from "@/lib/utils";
import { blockGroups, blockOptions } from "./block-meta";

export function BlockPalette({ onAdd }: { onAdd: (type: BlockType) => void }) {
  return (
    <aside className="overflow-auto border-r border-border bg-card p-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          Compose
        </p>
        <h2 className="mt-1 text-base font-semibold text-card-foreground">Blocks</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Drag onto the canvas, or click to add at the end.
        </p>
      </div>
      <div className="mt-4 grid gap-5">
        {blockGroups.map((group) => (
          <section key={group.label}>
            <h3 className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              {group.label}
            </h3>
            <div className="mt-2 grid gap-2">
              {group.blocks.map((type) => (
                <PaletteItem key={type} type={type} onAdd={onAdd} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function PaletteItem({ type, onAdd }: { type: BlockType; onAdd: (type: BlockType) => void }) {
  const option = blockOptions[type];
  const Icon = option.icon;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { source: "palette", blockType: type },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // Enter/Space adds the block via native click; keyboard dragging is for
      // canvas reordering only.
      onKeyDown={undefined}
      role={undefined}
      type="button"
      onClick={() => onAdd(type)}
      className={cn(
        "group grid cursor-grab touch-none gap-2 rounded-lg border border-border bg-surface p-3 text-left transition hover:border-primary/40 hover:bg-accent/45 active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-surface-foreground">
        <span className="flex size-8 items-center justify-center rounded-md bg-background text-primary">
          <Icon className="size-4" />
        </span>
        Add {blockLabels[type]}
      </span>
      <span className="text-xs leading-5 text-muted-foreground">{option.description}</span>
    </button>
  );
}

export function PaletteDragPreview({ type }: { type: BlockType }) {
  const option = blockOptions[type];
  const Icon = option.icon;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-card px-3 py-2 text-sm font-semibold text-card-foreground shadow-lg">
      <span className="flex size-7 items-center justify-center rounded-md bg-background text-primary">
        <Icon className="size-4" />
      </span>
      Add {blockLabels[type]}
    </div>
  );
}
