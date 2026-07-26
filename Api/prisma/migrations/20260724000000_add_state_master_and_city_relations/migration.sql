-- Create state masters
CREATE TABLE IF NOT EXISTS "state_masters" (
    "id" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "state_masters_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "state_masters_countryId_name_key" ON "state_masters"("countryId", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "state_masters_countryId_code_key" ON "state_masters"("countryId", "code");
CREATE INDEX IF NOT EXISTS "state_masters_countryId_status_idx" ON "state_masters"("countryId", "status");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'state_masters_countryId_fkey'
    ) THEN
        ALTER TABLE "state_masters"
        ADD CONSTRAINT "state_masters_countryId_fkey"
        FOREIGN KEY ("countryId") REFERENCES "countries"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Ensure UAE exists for backfill and default geo records
INSERT INTO "countries" ("code", "name", "defaultCurrency", "flag", "currencySymbol", "phoneCode", "status", "createdAt", "updatedAt")
VALUES ('AE', 'United Arab Emirates', 'AED', '🇦🇪', 'AED', '+971', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE
SET "name" = EXCLUDED."name",
    "defaultCurrency" = EXCLUDED."defaultCurrency",
    "flag" = EXCLUDED."flag",
    "currencySymbol" = EXCLUDED."currencySymbol",
    "phoneCode" = EXCLUDED."phoneCode",
    "status" = EXCLUDED."status",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Seed UAE states with stable IDs so existing city rows can be attached safely
INSERT INTO "state_masters" ("id", "countryId", "name", "code", "status", "createdAt", "updatedAt")
SELECT 'uae-dubai', c."id", 'Dubai', 'DU', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "countries" c WHERE c."code" = 'AE'
ON CONFLICT ("countryId", "name") DO UPDATE
SET "code" = EXCLUDED."code",
    "status" = EXCLUDED."status",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "state_masters" ("id", "countryId", "name", "code", "status", "createdAt", "updatedAt")
SELECT 'uae-abu-dhabi', c."id", 'Abu Dhabi', 'AZ', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "countries" c WHERE c."code" = 'AE'
ON CONFLICT ("countryId", "name") DO UPDATE
SET "code" = EXCLUDED."code",
    "status" = EXCLUDED."status",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "state_masters" ("id", "countryId", "name", "code", "status", "createdAt", "updatedAt")
SELECT 'uae-sharjah', c."id", 'Sharjah', 'SH', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "countries" c WHERE c."code" = 'AE'
ON CONFLICT ("countryId", "name") DO UPDATE
SET "code" = EXCLUDED."code",
    "status" = EXCLUDED."status",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "state_masters" ("id", "countryId", "name", "code", "status", "createdAt", "updatedAt")
SELECT 'uae-ajman', c."id", 'Ajman', 'AJ', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "countries" c WHERE c."code" = 'AE'
ON CONFLICT ("countryId", "name") DO UPDATE
SET "code" = EXCLUDED."code",
    "status" = EXCLUDED."status",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "state_masters" ("id", "countryId", "name", "code", "status", "createdAt", "updatedAt")
SELECT 'uae-ras-al-khaimah', c."id", 'Ras Al Khaimah', 'RK', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "countries" c WHERE c."code" = 'AE'
ON CONFLICT ("countryId", "name") DO UPDATE
SET "code" = EXCLUDED."code",
    "status" = EXCLUDED."status",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "state_masters" ("id", "countryId", "name", "code", "status", "createdAt", "updatedAt")
SELECT 'uae-fujairah', c."id", 'Fujairah', 'FU', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "countries" c WHERE c."code" = 'AE'
ON CONFLICT ("countryId", "name") DO UPDATE
SET "code" = EXCLUDED."code",
    "status" = EXCLUDED."status",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "state_masters" ("id", "countryId", "name", "code", "status", "createdAt", "updatedAt")
SELECT 'uae-umm-al-quwain', c."id", 'Umm Al Quwain', 'UQ', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "countries" c WHERE c."code" = 'AE'
ON CONFLICT ("countryId", "name") DO UPDATE
SET "code" = EXCLUDED."code",
    "status" = EXCLUDED."status",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Add city relations
ALTER TABLE "city_masters" ADD COLUMN IF NOT EXISTS "countryId" INTEGER;
ALTER TABLE "city_masters" ADD COLUMN IF NOT EXISTS "stateId" TEXT;
ALTER TABLE "city_masters" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing UAE cities
UPDATE "city_masters" cm
SET
  "countryId" = c."id",
  "stateId" = CASE LOWER(cm."name")
    WHEN 'dubai' THEN 'uae-dubai'
    WHEN 'abu dhabi' THEN 'uae-abu-dhabi'
    WHEN 'sharjah' THEN 'uae-sharjah'
    WHEN 'ajman' THEN 'uae-ajman'
    WHEN 'ras al khaimah' THEN 'uae-ras-al-khaimah'
    WHEN 'fujairah' THEN 'uae-fujairah'
    WHEN 'umm al quwain' THEN 'uae-umm-al-quwain'
    WHEN 'al ain' THEN 'uae-abu-dhabi'
    ELSE 'uae-abu-dhabi'
  END
FROM "countries" c
WHERE c."code" = 'AE';

-- Replace the old global unique city name constraint with scoped uniqueness
DROP INDEX IF EXISTS "city_masters_name_key";
CREATE UNIQUE INDEX IF NOT EXISTS "city_masters_stateId_name_key" ON "city_masters"("stateId", "name");
CREATE INDEX IF NOT EXISTS "city_masters_countryId_stateId_status_idx" ON "city_masters"("countryId", "stateId", "status");

ALTER TABLE "city_masters"
ALTER COLUMN "countryId" SET NOT NULL,
ALTER COLUMN "stateId" SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'city_masters_countryId_fkey'
    ) THEN
        ALTER TABLE "city_masters"
        ADD CONSTRAINT "city_masters_countryId_fkey"
        FOREIGN KEY ("countryId") REFERENCES "countries"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'city_masters_stateId_fkey'
    ) THEN
        ALTER TABLE "city_masters"
        ADD CONSTRAINT "city_masters_stateId_fkey"
        FOREIGN KEY ("stateId") REFERENCES "state_masters"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
