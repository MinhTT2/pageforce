import type { PageSchema } from "./blocks";

export type PageStatus = "DRAFT" | "PUBLISHED";

export type PageSummary = {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  updatedAt: string;
};

export type EditablePage = PageSummary & {
  schema: PageSchema;
};
