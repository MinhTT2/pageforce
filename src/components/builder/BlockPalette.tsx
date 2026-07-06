import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Search } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { blockLabels } from "@/lib/blocks";
import type { BlockType } from "@/types/blocks";
import { cn } from "@/lib/utils";
import { blockGroups, blockOptions } from "./block-meta";

const allTab = "all";

function blockMatchesQuery(type: BlockType, query: string) {
  const option = blockOptions[type];

  return (
    !query ||
    blockLabels[type].toLowerCase().includes(query) ||
    option.description.toLowerCase().includes(query)
  );
}

export const BlockPalette = memo(function BlockPalette({
  onAdd,
}: {
  onAdd: (type: BlockType) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(allTab);
  const normalizedQuery = query.trim().toLowerCase();
  const categoryFilters = useMemo(
    () => {
      const groups = blockGroups.map((group) => ({
        label: group.label,
        count: group.blocks.filter((type) => blockMatchesQuery(type, normalizedQuery)).length,
      }));

      return [
        {
          label: allTab,
          display: "All",
          count: groups.reduce((total, group) => total + group.count, 0),
        },
        ...groups.map((group) => ({
          label: group.label,
          display: group.label,
          count: group.count,
        })),
      ];
    },
    [normalizedQuery],
  );
  const visibleGroups = useMemo(
    () => {
      const groups =
        activeTab === allTab
          ? blockGroups
          : blockGroups.filter((group) => group.label === activeTab);

      return groups
        .map((group) => ({
          ...group,
          blocks: group.blocks.filter((type) => blockMatchesQuery(type, normalizedQuery)),
        }))
        .filter((group) => group.blocks.length > 0);
    },
    [activeTab, normalizedQuery],
  );
  const hasMatches = visibleGroups.length > 0;
  const showGroupHeadings = activeTab === allTab;

  return (
    <div className="flex min-h-0 flex-col overflow-hidden bg-card">
      <div className="border-b border-border bg-card px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="truncate text-base font-semibold leading-6 text-card-foreground">
            Blocks
          </h2>
          <span className="shrink-0 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Drag or click
          </span>
        </div>
        <div className="relative mt-2.5">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search blocks"
            aria-label="Search blocks"
            className="h-8 bg-surface pl-8 text-sm shadow-none"
          />
        </div>
      </div>
      <div className="border-b border-border bg-card px-3 py-2">
        <div
          className="-mx-0.5 flex gap-1 overflow-x-auto px-0.5 pb-0.5"
          aria-label="Block categories"
          role="group"
        >
          {categoryFilters.map((filter) => {
            const active = activeTab === filter.label;

            return (
              <button
                key={filter.label}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveTab(filter.label)}
                className={cn(
                  "flex h-7 flex-none items-center gap-1.5 rounded-md border px-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-surface-foreground",
                )}
              >
                <span className="truncate">{filter.display}</span>
                <span
                  className={cn(
                    "min-w-4 rounded px-1 py-0.5 text-center text-[10px] leading-none",
                    active
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "bg-background text-muted-foreground",
                  )}
                >
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-2.5">
        {hasMatches ? (
          <div className="grid gap-3">
            {visibleGroups.map((group) => (
              <section key={group.label} aria-labelledby={`palette-${group.label}`}>
                {showGroupHeadings ? (
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <h3
                      id={`palette-${group.label}`}
                      className="text-[10px] font-semibold uppercase tracking-normal text-muted-foreground"
                    >
                      {group.label}
                    </h3>
                    <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
                      {group.blocks.length}
                    </span>
                  </div>
                ) : (
                  <h3 id={`palette-${group.label}`} className="sr-only">
                    {group.label}
                  </h3>
                )}
                <div className="grid gap-1">
                  {group.blocks.map((type) => (
                    <PaletteItem key={type} type={type} onAdd={onAdd} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border bg-surface px-3 py-5 text-center">
            <p className="text-sm font-medium text-surface-foreground">No blocks found</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Try another category or keyword.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

function PaletteItem({ type, onAdd }: { type: BlockType; onAdd: (type: BlockType) => void }) {
  const option = blockOptions[type];
  const Icon = option.icon;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { source: "palette", blockType: type },
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
          aria-label={`Add ${blockLabels[type]} block. ${option.description}`}
          className={cn(
            "group flex h-12 w-full cursor-grab touch-none items-center gap-2 rounded-md border border-border bg-surface px-2 text-left transition hover:border-primary/35 hover:bg-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
            isDragging && "opacity-50",
          )}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-primary ring-1 ring-border/60 transition group-hover:ring-primary/25">
            <Icon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium leading-5 text-surface-foreground">
              {blockLabels[type]}
            </span>
            <span className="block truncate text-[11px] leading-4 text-muted-foreground">
              {option.description}
            </span>
          </span>
          <GripVertical className="size-4 shrink-0 text-muted-foreground/45 opacity-0 transition group-hover:text-primary group-hover:opacity-100 group-focus-visible:text-primary group-focus-visible:opacity-100" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {option.description}
      </TooltipContent>
    </Tooltip>
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
