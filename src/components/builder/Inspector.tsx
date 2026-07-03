import { Copy, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { blockLabels } from "@/lib/blocks";
import type { DesignTokens, PageBlock, PageSettings } from "@/types/blocks";
import { BlockEditor } from "./block-editors";
import { blockOptions } from "./block-meta";
import { DesignPanel } from "./DesignPanel";
import { PageSettingsPanel } from "./PageSettingsPanel";
import { StyleEditor } from "./StyleEditor";

export function Inspector({
  selectedBlock,
  settings,
  slug,
  publicUrl,
  onUpdateBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onClearSelection,
  onSlugChange,
  onSettingsChange,
  onTokensChange,
}: {
  selectedBlock: PageBlock | null;
  settings: PageSettings;
  slug: string;
  publicUrl: string;
  onUpdateBlock: (block: PageBlock) => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onClearSelection: () => void;
  onSlugChange: (value: string) => void;
  onSettingsChange: (patch: Partial<Omit<PageSettings, "tokens">>) => void;
  onTokensChange: (patch: Partial<DesignTokens>) => void;
}) {
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
          <Tabs defaultValue="content">
            <TabsList className="w-full">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-3">
              <BlockEditor block={selectedBlock} onChange={onUpdateBlock} />
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
        <div className="mt-4">
          <Tabs defaultValue="page">
            <TabsList className="w-full">
              <TabsTrigger value="page">Page</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
            </TabsList>
            <TabsContent value="page" className="mt-3">
              <PageSettingsPanel
                slug={slug}
                publicUrl={publicUrl}
                settings={settings}
                onSlugChange={onSlugChange}
                onSettingsChange={onSettingsChange}
              />
            </TabsContent>
            <TabsContent value="design" className="mt-3">
              <DesignPanel tokens={settings.tokens} onChange={onTokensChange} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </aside>
  );
}
