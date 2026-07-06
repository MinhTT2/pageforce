import { useState } from "react";
import { FileText, Palette, PanelsTopLeft, Search, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DesignTokens, PageSchema, PageSettings, SectionMode } from "@/types/blocks";
import type { PageSummary } from "@/types/page";
import { DesignPanel } from "./DesignPanel";
import { PageSettingsPanel, type PageSettingsTab } from "./PageSettingsPanel";

type SettingsTab = PageSettingsTab | "design";

const settingsTabs: {
  value: SettingsTab;
  label: string;
  icon: typeof FileText;
}[] = [
  { value: "page", label: "Page", icon: FileText },
  { value: "seo", label: "SEO", icon: Search },
  { value: "sections", label: "Sections", icon: PanelsTopLeft },
  { value: "design", label: "Design", icon: Palette },
];

export function BuilderPageSettingsSidebar({
  siteSlug,
  siteGlobalHeader,
  siteGlobalFooter,
  globalSectionsDirty,
  savingGlobalSections,
  globalSectionsNotice,
  pages,
  settings,
  title,
  slug,
  isHome,
  headerMode,
  footerMode,
  publicUrl,
  isLive,
  onTitleChange,
  onSlugChange,
  onIsHomeChange,
  onHeaderModeChange,
  onFooterModeChange,
  onGlobalHeaderChange,
  onGlobalFooterChange,
  onSaveGlobalSections,
  onSettingsChange,
  onTokensChange,
}: {
  siteSlug: string;
  siteGlobalHeader: PageSchema | null;
  siteGlobalFooter: PageSchema | null;
  globalSectionsDirty: boolean;
  savingGlobalSections: boolean;
  globalSectionsNotice: { tone: "success" | "error"; message: string } | null;
  pages: PageSummary[];
  settings: PageSettings;
  title: string;
  slug: string;
  isHome: boolean;
  headerMode: SectionMode;
  footerMode: SectionMode;
  publicUrl: string;
  isLive: boolean;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onIsHomeChange: (value: boolean) => void;
  onHeaderModeChange: (value: SectionMode) => void;
  onFooterModeChange: (value: SectionMode) => void;
  onGlobalHeaderChange: (schema: PageSchema | null) => void;
  onGlobalFooterChange: (schema: PageSchema | null) => void;
  onSaveGlobalSections: () => Promise<boolean>;
  onSettingsChange: (patch: Partial<Omit<PageSettings, "tokens">>) => void;
  onTokensChange: (patch: Partial<DesignTokens>) => void;
}) {
  const [tab, setTab] = useState<SettingsTab>("page");

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-r border-border bg-card">
      <div className="border-b border-border bg-card px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground">
              <Settings size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">
                Page settings
              </p>
              <h2 className="mt-0.5 truncate text-base font-semibold leading-6 text-card-foreground">
                {title || "Current page"}
              </h2>
            </div>
          </div>
          <Badge variant={isLive ? "success" : "warning"}>{isLive ? "Live" : "Draft"}</Badge>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3.5">
        <Tabs value={tab} onValueChange={(value) => setTab(value as SettingsTab)}>
          <TabsList className="grid h-auto w-full grid-cols-4 gap-1 p-1">
            {settingsTabs.map((item) => {
              const Icon = item.icon;

              return (
                <TabsTrigger key={item.value} value={item.value} className="h-8 px-1 text-xs">
                  <Icon size={13} />
                  <span className="hidden min-[340px]:inline">{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-4">
            {tab === "design" ? (
              <DesignPanel tokens={settings.tokens} onChange={onTokensChange} />
            ) : (
            <PageSettingsPanel
              activeTab={tab}
              title={title}
              slug={slug}
              siteSlug={siteSlug}
              siteGlobalHeader={siteGlobalHeader}
              siteGlobalFooter={siteGlobalFooter}
              globalSectionsDirty={globalSectionsDirty}
              savingGlobalSections={savingGlobalSections}
              globalSectionsNotice={globalSectionsNotice}
              pages={pages}
              isHome={isHome}
              headerMode={headerMode}
              footerMode={footerMode}
              publicUrl={publicUrl}
              isLive={isLive}
              settings={settings}
              onTitleChange={onTitleChange}
              onSlugChange={onSlugChange}
              onIsHomeChange={onIsHomeChange}
              onHeaderModeChange={onHeaderModeChange}
              onFooterModeChange={onFooterModeChange}
              onGlobalHeaderChange={onGlobalHeaderChange}
              onGlobalFooterChange={onGlobalFooterChange}
              onSaveGlobalSections={onSaveGlobalSections}
              onSettingsChange={onSettingsChange}
            />
            )}
          </div>
        </Tabs>
      </div>
    </aside>
  );
}
