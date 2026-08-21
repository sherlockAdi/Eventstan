-- Rename the legacy field without losing existing phone country codes.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'countryCode'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'phoneCountryCode'
  ) THEN
    ALTER TABLE "vendors" RENAME COLUMN "countryCode" TO "phoneCountryCode";
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'countryCode'
  ) THEN
    UPDATE "vendors"
    SET "phoneCountryCode" = COALESCE("phoneCountryCode", "countryCode")
    WHERE "phoneCountryCode" IS NULL;
    ALTER TABLE "vendors" DROP COLUMN "countryCode";
  END IF;
END $$;

ALTER TABLE "vendors"
  ADD COLUMN IF NOT EXISTS "phoneCountryCode" TEXT,
  ADD COLUMN IF NOT EXISTS "primaryMobileCountryCode" TEXT,
  ADD COLUMN IF NOT EXISTS "addressLine1" TEXT,
  ADD COLUMN IF NOT EXISTS "addressLine2" TEXT,
  ADD COLUMN IF NOT EXISTS "landmark" TEXT,
  ADD COLUMN IF NOT EXISTS "poBox" TEXT;

UPDATE "vendors"
SET
  "phoneCountryCode" = COALESCE(NULLIF("phoneCountryCode", ''), '+971'),
  "primaryMobileCountryCode" = COALESCE(NULLIF("primaryMobileCountryCode", ''), NULLIF("phoneCountryCode", ''), '+971'),
  "addressLine1" = COALESCE(NULLIF("addressLine1", ''), NULLIF(address, ''), 'Not provided'),
  "addressLine2" = COALESCE(NULLIF("addressLine2", ''), 'Not provided'),
  "poBox" = COALESCE(NULLIF("poBox", ''), 'Not provided');

ALTER TABLE "vendors"
  ALTER COLUMN "phoneCountryCode" SET NOT NULL,
  ALTER COLUMN "primaryMobileCountryCode" SET NOT NULL,
  ALTER COLUMN "addressLine1" SET NOT NULL,
  ALTER COLUMN "addressLine2" SET NOT NULL,
  ALTER COLUMN "poBox" SET NOT NULL;
