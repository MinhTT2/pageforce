import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createBlock } from "@/lib/blocks";
import type { PageBlock, PageSchema, PageSettings, SectionMode } from "@/types/blocks";
import { BlockEditor } from "./block-editors";
import { Field } from "./fields/Field";

export function PageSettingsPanel({
  activeTab,
  slug,
  siteId,
  siteGlobalHeader,
  siteGlobalFooter,
  isHome,
  headerMode,
  footerMode,
  headerSchema,
  footerSchema,
  publicUrl,
  isLive,
  settings,
  onSlugChange,
  onIsHomeChange,
  onHeaderModeChange,
  onFooterModeChange,
  onHeaderSchemaChange,
  onFooterSchemaChange,
  onSettingsChange,
}: {
  activeTab: "page" | "seo" | "sections";
  slug: string;
  siteId: string;
  siteGlobalHeader: PageSchema | null;
  siteGlobalFooter: PageSchema | null;
  isHome: boolean;
  headerMode: SectionMode;
  footerMode: SectionMode;
  headerSchema: PageSchema | null;
  footerSchema: PageSchema | null;
  publicUrl: string;
  isLive: boolean;
  settings: PageSettings;
  onSlugChange: (value: string) => void;
  onIsHomeChange: (value: boolean) => void;
  onHeaderModeChange: (value: SectionMode) => void;
  onFooterModeChange: (value: SectionMode) => void;
  onHeaderSchemaChange: (schema: PageSchema | null) => void;
  onFooterSchemaChange: (schema: PageSchema | null) => void;
  onSettingsChange: (patch: Partial<Omit<PageSettings, "tokens">>) => void;
}) {
  const [globalHeader, setGlobalHeader] = useState(siteGlobalHeader);
  const [globalFooter, setGlobalFooter] = useState(siteGlobalFooter);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [globalNotice, setGlobalNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  async function saveGlobalSections() {
    setSavingGlobal(true);
    setGlobalNotice(null);

    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ globalHeader, globalFooter }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Could not save global sections");
      }

      setGlobalNotice({ tone: "success", message: "Global sections saved." });
    } catch (error) {
      setGlobalNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Could not save global sections",
      });
    } finally {
      setSavingGlobal(false);
    }
  }

  if (activeTab === "seo") {
    return (
      <div className="space-y-4">
        <Field label="Meta title">
          <Input
            value={settings.metaTitle}
            onChange={(event) => onSettingsChange({ metaTitle: event.target.value })}
          />
        </Field>
        <Field label="Meta description">
          <Textarea
            value={settings.metaDescription}
            onChange={(event) => onSettingsChange({ metaDescription: event.target.value })}
          />
        </Field>
      </div>
    );
  }

  if (activeTab === "sections") {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 rounded-lg border border-border bg-background p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Site global sections</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Pages set to inherit will use these sections across the site.
            </p>
          </div>
          <GlobalSectionEditor
            title="Global header"
            schema={globalHeader}
            fallbackType="header"
            onSchemaChange={setGlobalHeader}
          />
          <GlobalSectionEditor
            title="Global footer"
            schema={globalFooter}
            fallbackType="footer"
            onSchemaChange={setGlobalFooter}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={savingGlobal}
            onClick={saveGlobalSections}
          >
            {savingGlobal ? "Saving global sections..." : "Save global sections"}
          </Button>
          {globalNotice ? (
            <p
              className={
                globalNotice.tone === "success"
                  ? "text-sm font-medium text-success"
                  : "text-sm font-medium text-destructive"
              }
            >
              {globalNotice.message}
            </p>
          ) : null}
        </div>
        <SectionModeEditor
          title="Header"
          mode={headerMode}
          schema={headerSchema}
          fallbackType="header"
          onModeChange={onHeaderModeChange}
          onSchemaChange={onHeaderSchemaChange}
        />
        <SectionModeEditor
          title="Footer"
          mode={footerMode}
          schema={footerSchema}
          fallbackType="footer"
          onModeChange={onFooterModeChange}
          onSchemaChange={onFooterSchemaChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Field label="Slug">
        <Input value={slug} onChange={(event) => onSlugChange(event.target.value)} />
      </Field>
      <label className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-surface-foreground">
        <input
          type="checkbox"
          checked={isHome}
          onChange={(event) => onIsHomeChange(event.target.checked)}
          className="size-4"
        />
        Use as this site&apos;s homepage
      </label>
      <div className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          Public URL
        </p>
        <p className="mt-1 truncate font-mono text-xs">{publicUrl}</p>
        <p className="mt-2 text-xs">
          {isLive ? "This URL is live." : "Add at least one block and save to make this URL live."}
        </p>
      </div>
    </div>
  );
}

function GlobalSectionEditor({
  title,
  schema,
  fallbackType,
  onSchemaChange,
}: {
  title: string;
  schema: PageSchema | null;
  fallbackType: "header" | "footer";
  onSchemaChange: (schema: PageSchema | null) => void;
}) {
  const block = schema?.blocks[0] ?? null;

  function updateBlock(nextBlock: PageBlock) {
    onSchemaChange({
      version: 2,
      settings: schema?.settings,
      blocks: [nextBlock],
    });
  }

  return (
    <div className="grid gap-2 rounded-md border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-surface-foreground">{title}</p>
        {block ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => onSchemaChange(null)}>
            Clear
          </Button>
        ) : null}
      </div>
      {block ? (
        <BlockEditor block={block} pageId="" onChange={updateBlock} />
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => onSchemaChange({ version: 2, blocks: [createBlock(fallbackType)] })}
        >
          Create {title.toLowerCase()}
        </Button>
      )}
    </div>
  );
}

function SectionModeEditor({
  title,
  mode,
  schema,
  fallbackType,
  onModeChange,
  onSchemaChange,
}: {
  title: string;
  mode: SectionMode;
  schema: PageSchema | null;
  fallbackType: "header" | "footer";
  onModeChange: (mode: SectionMode) => void;
  onSchemaChange: (schema: PageSchema | null) => void;
}) {
  const block = schema?.blocks[0] ?? null;

  function updateBlock(nextBlock: PageBlock) {
    onSchemaChange({
      version: 2,
      settings: schema?.settings,
      blocks: [nextBlock],
    });
  }

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-surface-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">Site global, page custom, or hidden.</p>
        </div>
        <select
          value={mode}
          onChange={(event) => onModeChange(event.target.value as SectionMode)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
        >
          <option value="INHERIT">Inherit</option>
          <option value="CUSTOM">Custom</option>
          <option value="HIDDEN">Hidden</option>
        </select>
      </div>
      {mode === "CUSTOM" ? (
        block ? (
          <BlockEditor block={block} pageId="" onChange={updateBlock} />
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              onSchemaChange({
                version: 2,
                blocks: [createBlock(fallbackType)],
              })
            }
          >
            Create custom {title.toLowerCase()}
          </Button>
        )
      ) : null}
    </div>
  );
}
