import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DesignTokens, PageSchema, PageSettings, SectionMode } from "@/types/blocks";
import { DesignPanel } from "./DesignPanel";
import { PageSettingsPanel } from "./PageSettingsPanel";

export function BuilderPageSettingsSidebar({
  siteId,
  siteGlobalHeader,
  siteGlobalFooter,
  settings,
  slug,
  isHome,
  headerMode,
  footerMode,
  headerSchema,
  footerSchema,
  publicUrl,
  isLive,
  onSlugChange,
  onIsHomeChange,
  onHeaderModeChange,
  onFooterModeChange,
  onHeaderSchemaChange,
  onFooterSchemaChange,
  onSettingsChange,
  onTokensChange,
}: {
  siteId: string;
  siteGlobalHeader: PageSchema | null;
  siteGlobalFooter: PageSchema | null;
  settings: PageSettings;
  slug: string;
  isHome: boolean;
  headerMode: SectionMode;
  footerMode: SectionMode;
  headerSchema: PageSchema | null;
  footerSchema: PageSchema | null;
  publicUrl: string;
  isLive: boolean;
  onSlugChange: (value: string) => void;
  onIsHomeChange: (value: boolean) => void;
  onHeaderModeChange: (value: SectionMode) => void;
  onFooterModeChange: (value: SectionMode) => void;
  onHeaderSchemaChange: (schema: PageSchema | null) => void;
  onFooterSchemaChange: (schema: PageSchema | null) => void;
  onSettingsChange: (patch: Partial<Omit<PageSettings, "tokens">>) => void;
  onTokensChange: (patch: Partial<DesignTokens>) => void;
}) {
  const [tab, setTab] = useState("page");

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-r border-border bg-card">
      <div className="border-b border-border bg-card px-3.5 py-3.5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">
            Page settings
          </p>
          <h2 className="mt-0.5 text-lg font-semibold leading-6 text-card-foreground">
            Current page
          </h2>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1">
            <TabsTrigger value="page">Page</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
          </TabsList>
          <TabsContent value="page" className="mt-4">
            <PageSettingsPanel
              activeTab="page"
              slug={slug}
              siteId={siteId}
              siteGlobalHeader={siteGlobalHeader}
              siteGlobalFooter={siteGlobalFooter}
              isHome={isHome}
              headerMode={headerMode}
              footerMode={footerMode}
              headerSchema={headerSchema}
              footerSchema={footerSchema}
              publicUrl={publicUrl}
              isLive={isLive}
              settings={settings}
              onSlugChange={onSlugChange}
              onIsHomeChange={onIsHomeChange}
              onHeaderModeChange={onHeaderModeChange}
              onFooterModeChange={onFooterModeChange}
              onHeaderSchemaChange={onHeaderSchemaChange}
              onFooterSchemaChange={onFooterSchemaChange}
              onSettingsChange={onSettingsChange}
            />
          </TabsContent>
          <TabsContent value="seo" className="mt-4">
            <PageSettingsPanel
              activeTab="seo"
              slug={slug}
              siteId={siteId}
              siteGlobalHeader={siteGlobalHeader}
              siteGlobalFooter={siteGlobalFooter}
              isHome={isHome}
              headerMode={headerMode}
              footerMode={footerMode}
              headerSchema={headerSchema}
              footerSchema={footerSchema}
              publicUrl={publicUrl}
              isLive={isLive}
              settings={settings}
              onSlugChange={onSlugChange}
              onIsHomeChange={onIsHomeChange}
              onHeaderModeChange={onHeaderModeChange}
              onFooterModeChange={onFooterModeChange}
              onHeaderSchemaChange={onHeaderSchemaChange}
              onFooterSchemaChange={onFooterSchemaChange}
              onSettingsChange={onSettingsChange}
            />
          </TabsContent>
          <TabsContent value="sections" className="mt-4">
            <PageSettingsPanel
              activeTab="sections"
              slug={slug}
              siteId={siteId}
              siteGlobalHeader={siteGlobalHeader}
              siteGlobalFooter={siteGlobalFooter}
              isHome={isHome}
              headerMode={headerMode}
              footerMode={footerMode}
              headerSchema={headerSchema}
              footerSchema={footerSchema}
              publicUrl={publicUrl}
              isLive={isLive}
              settings={settings}
              onSlugChange={onSlugChange}
              onIsHomeChange={onIsHomeChange}
              onHeaderModeChange={onHeaderModeChange}
              onFooterModeChange={onFooterModeChange}
              onHeaderSchemaChange={onHeaderSchemaChange}
              onFooterSchemaChange={onFooterSchemaChange}
              onSettingsChange={onSettingsChange}
            />
          </TabsContent>
          <TabsContent value="design" className="mt-4">
            <DesignPanel tokens={settings.tokens} onChange={onTokensChange} />
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
