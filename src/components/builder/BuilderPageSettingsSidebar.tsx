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
    <aside className="min-h-0 overflow-auto border-r border-border bg-card p-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          Page settings
        </p>
        <h2 className="mt-1 text-base font-semibold text-card-foreground">Current page</h2>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-4">
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
    </aside>
  );
}
