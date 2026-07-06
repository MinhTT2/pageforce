DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Page'
      AND column_name = 'draftSchema'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Page'
      AND column_name = 'schema'
  ) THEN
    ALTER TABLE "Page" RENAME COLUMN "draftSchema" TO "schema";
  END IF;
END $$;
