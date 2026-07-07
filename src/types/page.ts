import type { PageSchema } from "./blocks";
import type { SectionMode } from "./blocks";

export type PageStatus = "DRAFT" | "PUBLISHED";

export type SiteSummary = {
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
};

export type CreatedSiteSummary = SiteSummary & {
  homePageId: string;
  publicPath: string;
};

export type PageSummary = {
  id: string;
  siteId: string;
  siteName: string;
  siteSlug: string;
  title: string;
  slug: string;
  publicPath: string;
  isHome: boolean;
  headerMode: SectionMode;
  footerMode: SectionMode;
  status: PageStatus;
  updatedAt: string;
};

export type EditablePage = PageSummary & {
  schema: PageSchema;
  site: SiteSummary & {
    globalHeader: PageSchema | null;
    globalFooter: PageSchema | null;
    pages: PageSummary[];
  };
};
