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
  const visibleBlocks = useMemo(() => {
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
  }, [activeTab, normalizedQuery]);
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
      <PopoverContent className="w-96 max-w-[calc(100vw-2rem)]" align="center">
        <PopoverHeader>
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <TabsContent value={activeTab} className="mt-2">
              {hasMatches ? (
                <div className="grid grid-cols-3 gap-2">
                  {visibleBlocks.map((type) => (
                    <InsertMenuItem key={type} type={type} onAdd={add} />
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-border bg-surface px-3 py-4 text-center text-sm text-muted-foreground">
                  No blocks match
                </p>
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
          className="grid h-20 place-items-center gap-1.5 rounded-md border border-border bg-surface p-2 text-center transition hover:border-primary/40 hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-background text-primary">
            <Icon className="size-4" />
          </span>
          <span className="w-full truncate text-xs font-medium text-surface-foreground">
            {blockLabels[type]}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        {option.description}
      </TooltipContent>
    </Tooltip>
  );
}
