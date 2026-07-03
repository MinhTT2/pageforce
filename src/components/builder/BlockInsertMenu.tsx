import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { blockLabels } from "@/lib/blocks";
import type { BlockType } from "@/types/blocks";
import { blockGroups, blockOptions } from "./block-meta";

const allBlocks = blockGroups.flatMap((group) => group.blocks);
const allTab = "all";

function blockMatchesQuery(type: BlockType, query: string) {
  const option = blockOptions[type];

  return (
    !query ||
    blockLabels[type].toLowerCase().includes(query) ||
    option.description.toLowerCase().includes(query)
  );
}

export function BlockInsertMenu({
  label = "Add block",
  onAdd,
}: {
  label?: string;
  onAdd: (type: BlockType) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(allTab);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleBlocks = useMemo(
    () => {
      const source =
        activeTab === allTab
          ? allBlocks
          : blockGroups.find((group) => group.label === activeTab)?.blocks ?? [];

      return source.filter((type) => blockMatchesQuery(type, normalizedQuery));
    },
    [activeTab, normalizedQuery],
  );
  const hasMatches = visibleBlocks.length > 0;

  function add(type: BlockType) {
    onAdd(type);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" variant="secondary">
          <Plus />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[26rem] max-w-[calc(100vw-2rem)]" align="center">
        <PopoverHeader className="pb-1">
          <PopoverTitle>Add a block</PopoverTitle>
        </PopoverHeader>
        <div className="grid gap-3">
          <div className="relative">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-2">
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
            <TabsContent value={activeTab} className="max-h-80 overflow-auto pr-1">
              {hasMatches ? (
                <div className="grid gap-1.5">
                  {visibleBlocks.map((type) => (
                    <InsertMenuItem key={type} type={type} onAdd={add} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-surface px-3 py-6 text-center">
                  <p className="text-sm font-medium text-surface-foreground">No blocks found</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try another category or keyword.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function InsertMenuItem({ type, onAdd }: { type: BlockType; onAdd: (type: BlockType) => void }) {
  const option = blockOptions[type];
  const Icon = option.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => onAdd(type)}
          aria-label={`Add ${blockLabels[type]} block. ${option.description}`}
          className="group flex h-12 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-left transition hover:border-primary/35 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-primary ring-1 ring-border/60">
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
          <Plus className="size-3.5 shrink-0 text-muted-foreground/60 transition group-hover:text-primary" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        {option.description}
      </TooltipContent>
    </Tooltip>
  );
}
