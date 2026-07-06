ALTER TABLE "LeadSubmission"
ADD COLUMN "siteId" TEXT;

UPDATE "LeadSubmission"
SET "siteId" = "Page"."siteId"
FROM "Page"
WHERE "LeadSubmission"."pageId" = "Page"."id";

ALTER TABLE "LeadSubmission" ALTER COLUMN "siteId" SET NOT NULL;

ALTER TABLE "LeadSubmission" DROP CONSTRAINT IF EXISTS "LeadSubmission_pageId_fkey";
DROP INDEX IF EXISTS "LeadSubmission_pageId_createdAt_idx";

ALTER TABLE "LeadSubmission" DROP COLUMN "pageId";

DROP INDEX IF EXISTS "Page_userId_idx";
ALTER TABLE "Page" DROP COLUMN "userId";

CREATE INDEX "LeadSubmission_siteId_createdAt_idx" ON "LeadSubmission"("siteId", "createdAt");

ALTER TABLE "LeadSubmission"
ADD CONSTRAINT "LeadSubmission_siteId_fkey"
FOREIGN KEY ("siteId") REFERENCES "Site"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
