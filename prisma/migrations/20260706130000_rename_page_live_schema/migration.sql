-- The MVP uses live-save publishing, so the editable schema is the public schema
-- once a page has content. Keep the live data and remove the unused compatibility copy.
ALTER TABLE "Page" RENAME COLUMN "draftSchema" TO "schema";
ALTER TABLE "Page" DROP COLUMN "publishedSchema";
