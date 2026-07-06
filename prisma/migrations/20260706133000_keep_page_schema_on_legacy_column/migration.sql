-- Keep the physical column name stable for zero-downtime app deploys.
-- Prisma exposes this as Page.schema via @map("draftSchema").
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Page'
      AND column_name = 'schema'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Page'
      AND column_name = 'draftSchema'
  ) THEN
    ALTER TABLE "Page" RENAME COLUMN "schema" TO "draftSchema";
  END IF;
END $$;
