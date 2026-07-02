-- Keep the latest page per user before enforcing one landing page per user.
DELETE FROM "Page"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "userId"
        ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" DESC
      ) AS row_number
    FROM "Page"
  ) ranked_pages
  WHERE ranked_pages.row_number > 1
);

-- Split editable draft content from the published public snapshot.
ALTER TABLE "Page" ADD COLUMN "draftSchema" JSONB;
ALTER TABLE "Page" ADD COLUMN "publishedSchema" JSONB;
ALTER TABLE "Page" ADD COLUMN "publishedAt" TIMESTAMP(3);

UPDATE "Page"
SET
  "draftSchema" = "schema",
  "publishedSchema" = CASE
    WHEN "status" = 'PUBLISHED' THEN "schema"
    ELSE NULL
  END,
  "publishedAt" = CASE
    WHEN "status" = 'PUBLISHED' THEN "updatedAt"
    ELSE NULL
  END;

ALTER TABLE "Page" ALTER COLUMN "draftSchema" SET NOT NULL;
ALTER TABLE "Page" DROP COLUMN "schema";

DROP INDEX "Page_userId_idx";
CREATE UNIQUE INDEX "Page_userId_key" ON "Page"("userId");
