DROP INDEX IF EXISTS "Page_legacySlug_key";

ALTER TABLE "Page" DROP COLUMN IF EXISTS "legacySlug";
