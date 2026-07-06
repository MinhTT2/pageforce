import {
  Check,
  Copy,
  EyeOff,
  Globe2,
  Home,
  Link2,
  PanelTop,
  RotateCw,
  Save,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createBlock } from "@/lib/blocks";
import { buildSiteHeaderSchema } from "@/lib/templates";
import type { PageBlock, PageSchema, PageSettings, SectionMode } from "@/types/blocks";
import type { PageSummary } from "@/types/page";
import { BlockEditor } from "./block-editors";
import { Field, Panel } from "./fields/Field";

export type PageSettingsTab = "page" | "seo" | "sections";

export function PageSettingsPanel({
  activeTab,
  title,
  slug,
  siteId,
  siteSlug,
  siteGlobalHeader,
  siteGlobalFooter,
  pages,
  isHome,
  headerMode,
  footerMode,
  headerSchema,
  footerSchema,
  publicUrl,
  isLive,
  settings,
  onTitleChange,
  onSlugChange,
  onIsHomeChange,
  onHeaderModeChange,
  onFooterModeChange,
  onHeaderSchemaChange,
  onFooterSchemaChange,
  onSettingsChange,
}: {
  activeTab: PageSettingsTab;
  title: string;
  slug: string;
  siteId: string;
  siteSlug: string;
  siteGlobalHeader: PageSchema | null;
  siteGlobalFooter: PageSchema | null;
  pages: PageSummary[];
  isHome: boolean;
  headerMode: SectionMode;
  footerMode: SectionMode;
  headerSchema: PageSchema | null;
  footerSchema: PageSchema | null;
  publicUrl: string;
  isLive: boolean;
  settings: PageSettings;
  onTitleChange: (value: string) => void;
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
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [globalNotice, setGlobalNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  function syncNavigationFromPages() {
    const headerBlock = globalHeader?.blocks.find((block) => block.type === "header");
    const brandText =
      headerBlock?.type === "header"
        ? headerBlock.props.brandText
        : pages[0]?.siteName || "Pageforce";

    setGlobalHeader(
      buildSiteHeaderSchema({
        brandText,
        pages,
        siteSlug,
      }),
    );
    setGlobalNotice({
      tone: "success",
      message: "Navigation synced. Save global sections to publish it.",
    });
  }

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

  async function copyPublicUrl() {
    if (!navigator.clipboard) {
      setCopyStatus("failed");
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1800);
    } catch {
      setCopyStatus("failed");
    }
  }

  if (activeTab === "seo") {
    const previewTitle = settings.metaTitle || title || "Untitled page";
    const previewDescription =
      settings.metaDescription || `${pages[0]?.siteName || "Pageforce"} landing page`;

    return (
      <div className="space-y-4">
        <Panel title="Search preview" description="Metadata used by the public page.">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="truncate text-[13px] text-success">{publicUrl}</p>
            <p className="mt-1 truncate text-base font-semibold leading-6 text-primary">
              {previewTitle}
            </p>
            <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">
              {previewDescription}
            </p>
          </div>
          <Field label="Meta title">
            <Input
              value={settings.metaTitle}
              placeholder={title || "Launch page"}
              onChange={(event) => onSettingsChange({ metaTitle: event.target.value })}
            />
          </Field>
          <Field label="Meta description">
            <Textarea
              value={settings.metaDescription}
              placeholder="A concise summary for search results and link previews."
              onChange={(event) => onSettingsChange({ metaDescription: event.target.value })}
            />
          </Field>
        </Panel>
      </div>
    );
  }

  if (activeTab === "sections") {
    return (
      <div className="space-y-4">
        <Panel title="Site global sections" description="Shared header and footer for this site.">
          <Button type="button" variant="outline" onClick={syncNavigationFromPages}>
            <RotateCw size={14} />
            Sync navigation from pages
          </Button>
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
            <Save size={14} />
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
        </Panel>
        <Panel title="This page sections" description="Override shared sections for this page.">
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
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Panel title="Identity" description="Name, path, and homepage routing.">
        <Field label="Page title">
          <Input value={title} onChange={(event) => onTitleChange(event.target.value)} />
        </Field>
        <Field label="Slug">
          <Input value={slug} onChange={(event) => onSlugChange(event.target.value)} />
        </Field>
        <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground">
          <span className="flex min-w-0 items-center gap-2">
            <Home size={15} className="text-muted-foreground" />
            <span className="truncate">Site homepage</span>
          </span>
          <input
            type="checkbox"
            checked={isHome}
            onChange={(event) => onIsHomeChange(event.target.checked)}
            className="size-4 accent-primary"
          />
        </label>
      </Panel>
      <Panel title="Public URL" description="Visitor-facing route for this page.">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Globe2 size={14} className="text-muted-foreground" />
                <StatusBadge isLive={isLive} />
              </div>
              <p className="mt-2 truncate font-mono text-xs text-foreground">{publicUrl}</p>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Copy URL" onClick={copyPublicUrl}>
              {copyStatus === "copied" ? <Check size={14} /> : <Copy size={14} />}
            </Button>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {isLive ? "Published with saved content." : "Draft until the page has content and is saved."}
          </p>
          {copyStatus === "failed" ? (
            <p className="mt-1 text-xs font-medium text-destructive">Could not copy URL.</p>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function StatusBadge({ isLive }: { isLive: boolean }) {
  return (
    <Badge variant={isLive ? "success" : "warning"}>{isLive ? "Live" : "Draft"}</Badge>
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
    <div className="grid gap-3 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <PanelTop size={14} className="text-muted-foreground" />
          {title}
        </p>
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
          <Link2 size={14} />
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
    <div className="grid gap-3 rounded-lg border border-border bg-background p-3">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              {mode === "HIDDEN" ? (
                <EyeOff size={14} className="text-muted-foreground" />
              ) : (
                <PanelTop size={14} className="text-muted-foreground" />
              )}
              {title}
            </p>
          </div>
          <ModeBadge mode={mode} />
        </div>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => value && onModeChange(value as SectionMode)}
          className="grid w-full grid-cols-3 rounded-lg bg-muted p-1"
        >
          <ToggleGroupItem value="INHERIT" className="h-7 text-xs">
            Inherit
          </ToggleGroupItem>
          <ToggleGroupItem value="CUSTOM" className="h-7 text-xs">
            Custom
          </ToggleGroupItem>
          <ToggleGroupItem value="HIDDEN" className="h-7 text-xs">
            Hidden
          </ToggleGroupItem>
        </ToggleGroup>
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
            <Link2 size={14} />
            Create custom {title.toLowerCase()}
          </Button>
        )
      ) : null}
    </div>
  );
}

function ModeBadge({ mode }: { mode: SectionMode }) {
  if (mode === "CUSTOM") return <Badge variant="secondary">Custom</Badge>;
  if (mode === "HIDDEN") return <Badge variant="outline">Hidden</Badge>;
  return <Badge variant="success">Inherit</Badge>;
}
