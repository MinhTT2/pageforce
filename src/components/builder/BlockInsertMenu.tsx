import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { blockLabels } from "@/lib/blocks";
import type { BlockType } from "@/types/blocks";
import { blockGroups, blockOptions } from "./block-meta";

export function BlockInsertMenu({
  label = "Add block",
  onAdd,
}: {
  label?: string;
  onAdd: (type: BlockType) => void;
}) {
  const [open, setOpen] = useState(false);

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
      <PopoverContent className="w-80" align="center">
        <PopoverHeader>
          <PopoverTitle>Add a block</PopoverTitle>
        </PopoverHeader>
        <div className="grid gap-3">
          {blockGroups.map((group) => (
            <section key={group.label}>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                {group.label}
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {group.blocks.map((type) => {
                  const option = blockOptions[type];
                  const Icon = option.icon;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => add(type)}
                      className="flex min-h-12 items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-left text-sm font-medium text-surface-foreground transition hover:border-primary/40 hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 truncate">{blockLabels[type]}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
