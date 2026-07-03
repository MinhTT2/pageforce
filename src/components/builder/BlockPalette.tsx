import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Search } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-r border-border bg-card/95">
      <div className="border-b border-border bg-card px-3.5 py-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">
              Add elements
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-card-foreground">Blocks</h2>
          </div>
          <span className="rounded-md bg-surface px-2 py-1 text-[11px] font-medium text-muted-foreground">
            Drag / Click
          </span>
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search blocks"
            aria-label="Search blocks"
            className="pl-8"
          />
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-0 flex-1 gap-0">
        <div className="border-b border-border bg-card px-3 py-2">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto">
            <TabsTrigger value={allTab} className="h-7 flex-none px-2 text-xs">
              All
            </TabsTrigger>
            {blockGroups.map((group) => (
              <TabsTrigger
                key={group.label}
                value={group.label}
                className="h-7 flex-none px-2 text-xs"
              >
                {group.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value={activeTab} className="min-h-0 overflow-auto px-3 py-3">
          {hasMatches ? (
            <div className="grid gap-4">
              {visibleGroups.map((group) => (
                <section key={group.label}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">
                      {group.label}
                    </h3>
                    <span className="text-[11px] text-muted-foreground">
                      {group.blocks.length}
                    </span>
                  </div>
                  <div className="grid gap-1.5">
                    {group.blocks.map((type) => (
                      <PaletteItem key={type} type={type} onAdd={onAdd} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-surface px-3 py-6 text-center">
              <p className="text-sm font-medium text-surface-foreground">No blocks found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try another category or keyword.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </aside>
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
            "group flex h-14 cursor-grab touch-none items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-left shadow-sm shadow-primary/0 transition hover:-translate-y-px hover:border-primary/35 hover:bg-accent/40 hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
            isDragging && "opacity-50",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-primary ring-1 ring-border/60">
            <Icon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-surface-foreground">
              {blockLabels[type]}
            </span>
            <span className="mt-0.5 block truncate text-[11px] leading-none text-muted-foreground">
              {option.description}
            </span>
          </span>
          <GripVertical className="size-4 shrink-0 text-muted-foreground/55 opacity-70 transition group-hover:text-primary" />
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
