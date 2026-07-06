CREATE TYPE "SectionMode" AS ENUM ('INHERIT', 'CUSTOM', 'HIDDEN');

CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "globalHeader" JSONB,
    "globalFooter" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");
CREATE INDEX "Site_userId_idx" ON "Site"("userId");

ALTER TABLE "Page"
ADD COLUMN "siteId" TEXT,
ADD COLUMN "legacySlug" TEXT,
ADD COLUMN "isHome" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "headerMode" "SectionMode" NOT NULL DEFAULT 'INHERIT',
ADD COLUMN "footerMode" "SectionMode" NOT NULL DEFAULT 'INHERIT',
ADD COLUMN "headerSchema" JSONB,
ADD COLUMN "footerSchema" JSONB;

INSERT INTO "Site" ("id", "userId", "name", "slug", "createdAt", "updatedAt")
SELECT
  'site_' || md5("userId"),
  "userId",
  'My Site',
  'site-' || substr(md5("userId"), 1, 10),
  MIN("createdAt"),
  MAX("updatedAt")
FROM "Page"
GROUP BY "userId";

UPDATE "Page"
SET
  "siteId" = 'site_' || md5("userId"),
  "legacySlug" = "slug";

UPDATE "Page"
SET "isHome" = true
WHERE "id" IN (
  SELECT DISTINCT ON ("siteId") "id"
  FROM "Page"
  WHERE "siteId" IS NOT NULL
  ORDER BY "siteId", "updatedAt" DESC, "createdAt" DESC
);

ALTER TABLE "Page" ALTER COLUMN "siteId" SET NOT NULL;

ALTER TABLE "Page" DROP CONSTRAINT IF EXISTS "Page_slug_key";

CREATE UNIQUE INDEX "Page_legacySlug_key" ON "Page"("legacySlug");
CREATE INDEX "Page_siteId_idx" ON "Page"("siteId");
CREATE UNIQUE INDEX "Page_siteId_slug_key" ON "Page"("siteId", "slug");

ALTER TABLE "Page"
ADD CONSTRAINT "Page_siteId_fkey"
FOREIGN KEY ("siteId") REFERENCES "Site"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
