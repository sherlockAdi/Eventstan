-- Add optional day range columns to event packages
ALTER TABLE "event_packages"
ADD COLUMN "minDays" INTEGER,
ADD COLUMN "maxDays" INTEGER;
