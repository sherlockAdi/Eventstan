CREATE TABLE IF NOT EXISTS "user_leads" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "preferredEventDate" TIMESTAMP(3),
  "expectedGuestCount" INTEGER,
  "budgetRange" JSONB,
  "servicesNeeded" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "additionalDetails" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "vendor_leads" (
  "id" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "yourName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "websiteSocialMedia" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "serviceCategoryId" TEXT,
  "cityId" TEXT,
  "yearsOfExperience" INTEGER,
  "message" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vendor_leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "user_leads_status_created_at_idx" ON "user_leads" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "user_leads_email_idx" ON "user_leads" ("email");
CREATE INDEX IF NOT EXISTS "vendor_leads_status_created_at_idx" ON "vendor_leads" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "vendor_leads_email_idx" ON "vendor_leads" ("email");
