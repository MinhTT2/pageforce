import { Copy, PanelRightClose, Trash2, X } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { blockLabels } from "@/lib/blocks";
import type { PageBlock, PageSettings } from "@/types/blocks";
import { BlockEditor } from "./block-editors";
import { blockOptions } from "./block-meta";
import { StyleEditor } from "./StyleEditor";

export const Inspector = memo(function Inspector({
  selectedBlock,
  pageId,
  settings,
  onUpdateBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onClearSelection,
  onClose,
}: {
  selectedBlock: PageBlock | null;
  pageId: string;
  settings: PageSettings;
  onUpdateBlock: (block: PageBlock) => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onClearSelection: () => void;
  onClose: () => void;
}) {
  const [blockTab, setBlockTab] = useState("content");

  return (
    <aside className="overflow-auto border-l border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Inspect
          </p>
          <h2 className="mt-1 text-base font-semibold text-card-foreground">
            {selectedBlock ? "Block" : "Page"}
          </h2>
        </div>
        <div className="flex gap-1">
          {selectedBlock ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear selected block"
              onClick={onClearSelection}
            >
              <X size={16} />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" aria-label="Hide inspector" onClick={onClose}>
            <PanelRightClose size={16} />
          </Button>
        </div>
      </div>
      {selectedBlock ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-surface-foreground">
                {blockLabels[selectedBlock.type]} block
              </p>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Duplicate block"
                  onClick={() => onDuplicateBlock(selectedBlock.id)}
                >
                  <Copy size={15} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete block"
                  onClick={() => onDeleteBlock(selectedBlock.id)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {blockOptions[selectedBlock.type].description}
            </p>
          </div>
          <Tabs value={blockTab} onValueChange={setBlockTab}>
            <TabsList className="w-full">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-3">
              <BlockEditor block={selectedBlock} pageId={pageId} onChange={onUpdateBlock} />
            </TabsContent>
            <TabsContent value="style" className="mt-3">
              <StyleEditor
                block={selectedBlock}
                tokens={settings.tokens}
                onChange={onUpdateBlock}
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-surface p-4">
          <p className="text-sm font-medium text-surface-foreground">Select a block</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Use the page icon in the header for page settings, or select a canvas block to edit its
            content and style here.
          </p>
        </div>
      )}
    </aside>
  );
});
