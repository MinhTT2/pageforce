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
  siteSlug,
  siteGlobalHeader,
  siteGlobalFooter,
  globalSectionsDirty,
  savingGlobalSections,
  globalSectionsNotice,
  pages,
  isHome,
  headerMode,
  footerMode,
  publicUrl,
  isLive,
  settings,
  onTitleChange,
  onSlugChange,
  onIsHomeChange,
  onHeaderModeChange,
  onFooterModeChange,
  onGlobalHeaderChange,
  onGlobalFooterChange,
  onSaveGlobalSections,
  onSettingsChange,
}: {
  activeTab: PageSettingsTab;
  title: string;
  slug: string;
  siteSlug: string;
  siteGlobalHeader: PageSchema | null;
  siteGlobalFooter: PageSchema | null;
  globalSectionsDirty: boolean;
  savingGlobalSections: boolean;
  globalSectionsNotice: { tone: "success" | "error"; message: string } | null;
  pages: PageSummary[];
  isHome: boolean;
  headerMode: SectionMode;
  footerMode: SectionMode;
  publicUrl: string;
  isLive: boolean;
  settings: PageSettings;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onIsHomeChange: (value: boolean) => void;
  onHeaderModeChange: (value: SectionMode) => void;
  onFooterModeChange: (value: SectionMode) => void;
  onGlobalHeaderChange: (schema: PageSchema | null) => void;
  onGlobalFooterChange: (schema: PageSchema | null) => void;
  onSaveGlobalSections: () => Promise<boolean>;
  onSettingsChange: (patch: Partial<Omit<PageSettings, "tokens">>) => void;
}) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  function syncNavigationFromPages() {
    const headerBlock = siteGlobalHeader?.blocks.find((block) => block.type === "header");
    const brandText =
      headerBlock?.type === "header"
        ? headerBlock.props.brandText
        : pages[0]?.siteName || "Pageforce";

    onGlobalHeaderChange(
      buildSiteHeaderSchema({
        brandText,
        pages,
        siteSlug,
      }),
    );
  }

  async function saveGlobalSections() {
    await onSaveGlobalSections();
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
            schema={siteGlobalHeader}
            fallbackType="header"
            onSchemaChange={onGlobalHeaderChange}
          />
          <GlobalSectionEditor
            title="Global footer"
            schema={siteGlobalFooter}
            fallbackType="footer"
            onSchemaChange={onGlobalFooterChange}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={savingGlobalSections || !globalSectionsDirty}
            onClick={saveGlobalSections}
          >
            <Save size={14} />
            {savingGlobalSections ? "Saving global sections..." : "Save global sections"}
          </Button>
          {globalSectionsNotice?.tone === "error" ? (
            <p className="text-sm font-medium text-destructive">
              {globalSectionsNotice.message}
            </p>
          ) : null}
        </Panel>
        <Panel title="This page sections" description="Choose whether this page shows the shared sections.">
          <SectionVisibilityEditor
            title="Header"
            mode={headerMode}
            onModeChange={onHeaderModeChange}
          />
          <SectionVisibilityEditor
            title="Footer"
            mode={footerMode}
            onModeChange={onFooterModeChange}
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

function SectionVisibilityEditor({
  title,
  mode,
  onModeChange,
}: {
  title: string;
  mode: SectionMode;
  onModeChange: (mode: SectionMode) => void;
}) {
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
          className="grid w-full grid-cols-2 rounded-lg bg-muted p-1"
        >
          <ToggleGroupItem value="INHERIT" className="h-7 text-xs">
            Use global
          </ToggleGroupItem>
          <ToggleGroupItem value="HIDDEN" className="h-7 text-xs">
            Hide
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

function ModeBadge({ mode }: { mode: SectionMode }) {
  if (mode === "HIDDEN") return <Badge variant="outline">Hidden</Badge>;
  return <Badge variant="success">Global</Badge>;
}
