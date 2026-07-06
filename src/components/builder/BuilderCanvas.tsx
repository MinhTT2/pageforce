import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FileText, Layers3, MousePointerClick, Send, Sparkles } from "lucide-react";
import { memo, useCallback, useMemo, type ReactNode } from "react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Button } from "@/components/ui/button";
import type { BlockType, PageBlock, PageSchema } from "@/types/blocks";
import type { PageTemplate, PageTemplateKey } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { BlockInsertMenu } from "./BlockInsertMenu";
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
  onMoveBlock,
  onAddBlock,
  onApplyTemplate,
  templates,
}: {
  schema: PageSchema;
  selectedBlockId: string | null;
  dropIndicator: DropIndicator;
  isPaletteDragging: boolean;
  templates: PageTemplate[];
  onSelectBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onMoveBlock: (id: string, delta: number) => void;
  onAddBlock: (type: BlockType, index?: number) => void;
  onApplyTemplate: (key: PageTemplateKey) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });
  const indexById = useMemo(
    () => new Map(schema.blocks.map((block, index) => [block.id, index])),
    [schema.blocks],
  );
  const onAddBlockAt = useCallback(
    (type: BlockType, index: number) => onAddBlock(type, index),
    [onAddBlock],
  );

  // Stable unless selection or the drop indicator actually changes — those are
  // exactly the renders memo(BlockRenderer) must let through.
  const renderBlockWrapper = useCallback(
    (block: PageBlock, children: ReactNode) => (
      <>
        {(indexById.get(block.id) ?? 0) === 0 ? (
          <InsertDivider label="Add block above" onAdd={(type) => onAddBlockAt(type, 0)} />
        ) : null}
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
          onMove={onMoveBlock}
          index={indexById.get(block.id) ?? 0}
          count={schema.blocks.length}
        >
          {children}
        </CanvasBlock>
        <InsertDivider
          label="Add block here"
          onAdd={(type) => onAddBlockAt(type, (indexById.get(block.id) ?? 0) + 1)}
        />
      </>
    ),
    [
      selectedBlockId,
      dropIndicator,
      onSelectBlock,
      onDuplicateBlock,
      onDeleteBlock,
      onMoveBlock,
      onAddBlockAt,
      indexById,
      schema.blocks.length,
    ],
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
        {schema.blocks.length === 0 ? (
          <EmptyBuilderStart
            templates={templates}
            onAddBlock={onAddBlock}
            onApplyTemplate={onApplyTemplate}
          />
        ) : (
          <SortableContext
            items={schema.blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <BlockRenderer
              schema={schema}
              renderMode="editor"
              renderBlockWrapper={renderBlockWrapper}
              emptyActions={emptyActions}
            />
          </SortableContext>
        )}
        {dropIndicator === "canvas-end" && schema.blocks.length > 0 ? (
          <div className="h-0.5 bg-primary" />
        ) : null}
      </div>
    </section>
  );
});

function InsertDivider({
  label,
  onAdd,
}: {
  label: string;
  onAdd: (type: BlockType) => void;
}) {
  return (
    <div className="group/insert relative z-10 flex h-0 items-center justify-center overflow-visible">
      <div className="pointer-events-none absolute inset-x-6 h-px bg-primary/0 transition group-hover/insert:bg-primary/20 group-focus-within/insert:bg-primary/20" />
      <div className="translate-y-0 opacity-0 transition group-hover/insert:opacity-100 group-focus-within/insert:opacity-100">
        <BlockInsertMenu label={label} onAdd={onAdd} />
      </div>
    </div>
  );
}

function EmptyBuilderStart({
  templates,
  onAddBlock,
  onApplyTemplate,
}: {
  templates: PageTemplate[];
  onAddBlock: (type: BlockType) => void;
  onApplyTemplate: (key: PageTemplateKey) => void;
}) {
  const quickBlocks: Array<{ type: BlockType; label: string; icon: typeof Sparkles }> = [
    { type: "hero", label: "Add hero", icon: Sparkles },
    { type: "leadForm", label: "Add lead form", icon: Send },
    { type: "cta", label: "Add CTA", icon: MousePointerClick },
  ];

  return (
    <div className="grid min-h-[34rem] gap-8 px-6 py-10 md:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)] md:items-center">
      <div>
        <div className="flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Sparkles className="size-5" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">
          Start with the shape of the page
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Pick a ready-made structure or add the first conversion block. A practical website page
          usually starts with Hero, Features, CTA or Lead Form, then FAQ and Footer.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <BlockInsertMenu label="Start from blocks" onAdd={onAddBlock} />
          {quickBlocks.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                key={item.type}
                type="button"
                variant="secondary"
                onClick={() => onAddBlock(item.type)}
              >
                <Icon />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <FileText className="size-4 text-primary" />
          Start from template
        </div>
        <div className="mt-3 grid gap-2">
          {templates.map((template) => (
            <button
              key={template.key}
              type="button"
              onClick={() => onApplyTemplate(template.key)}
              className="flex items-start gap-3 rounded-md border border-border bg-surface p-3 text-left transition hover:border-primary/40 hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-primary">
                <Layers3 className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium text-surface-foreground">
                  {template.name}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {template.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
