import { useDraggable } from "@dnd-kit/core";
import { Search } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { blockLabels } from "@/lib/blocks";
import type { BlockType } from "@/types/blocks";
import { cn } from "@/lib/utils";
import { blockGroups, blockOptions } from "./block-meta";

const allBlocks = blockGroups.flatMap((group) => group.blocks);
const allTab = "all";

export const BlockPalette = memo(function BlockPalette({
  onAdd,
}: {
  onAdd: (type: BlockType) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(allTab);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleBlocks = useMemo(
    () => {
      const source =
        activeTab === allTab
          ? allBlocks
          : blockGroups.find((group) => group.label === activeTab)?.blocks ?? [];

      return source.filter((type) => {
        const option = blockOptions[type];

        return (
          !normalizedQuery ||
          blockLabels[type].toLowerCase().includes(normalizedQuery) ||
          option.description.toLowerCase().includes(normalizedQuery)
        );
      });
    },
    [activeTab, normalizedQuery],
  );
  const hasMatches = visibleBlocks.length > 0;

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          Compose
        </p>
        <h2 className="mt-1 text-base font-semibold text-card-foreground">Block catalog</h2>
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
        <div className="border-b border-border px-3 py-2">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value={allTab} className="flex-none px-2 text-xs">
              All
            </TabsTrigger>
            {blockGroups.map((group) => (
              <TabsTrigger key={group.label} value={group.label} className="flex-none px-2 text-xs">
                {group.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value={activeTab} className="min-h-0 overflow-auto p-3">
          {hasMatches ? (
            <div className="grid grid-cols-2 gap-2">
              {visibleBlocks.map((type) => (
                <PaletteItem key={type} type={type} onAdd={onAdd} />
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-border bg-surface px-3 py-4 text-center text-sm text-muted-foreground">
              No blocks match
            </p>
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
            "grid h-24 cursor-grab touch-none place-items-center gap-2 rounded-lg border border-border bg-surface p-2 text-center transition hover:border-primary/40 hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
            isDragging && "opacity-50",
          )}
        >
          <span className="flex size-9 items-center justify-center rounded-md bg-background text-primary">
            <Icon className="size-4" />
          </span>
          <span className="w-full truncate text-xs font-semibold text-surface-foreground">
            {blockLabels[type]}
          </span>
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
