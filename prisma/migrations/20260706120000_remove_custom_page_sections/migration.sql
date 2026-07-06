UPDATE "Page"
SET "headerMode" = 'INHERIT'
WHERE "headerMode" = 'CUSTOM';

UPDATE "Page"
SET "footerMode" = 'INHERIT'
WHERE "footerMode" = 'CUSTOM';

ALTER TABLE "Page"
DROP COLUMN "headerSchema",
DROP COLUMN "footerSchema";

ALTER TYPE "SectionMode" RENAME TO "SectionMode_old";
CREATE TYPE "SectionMode" AS ENUM ('INHERIT', 'HIDDEN');

ALTER TABLE "Page"
ALTER COLUMN "headerMode" DROP DEFAULT,
ALTER COLUMN "footerMode" DROP DEFAULT;

ALTER TABLE "Page"
ALTER COLUMN "headerMode" TYPE "SectionMode" USING "headerMode"::text::"SectionMode",
ALTER COLUMN "footerMode" TYPE "SectionMode" USING "footerMode"::text::"SectionMode";

ALTER TABLE "Page"
ALTER COLUMN "headerMode" SET DEFAULT 'INHERIT',
ALTER COLUMN "footerMode" SET DEFAULT 'INHERIT';

DROP TYPE "SectionMode_old";
