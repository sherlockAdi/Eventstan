ALTER TABLE "vendors"
ADD COLUMN "contractType" TEXT,
ADD COLUMN "hourlyRate" INTEGER,
ADD COLUMN "availableHoursPerWeek" INTEGER,
ADD COLUMN "projectRate" INTEGER,
ADD COLUMN "salaryType" TEXT,
ADD COLUMN "basicSalary" INTEGER,
ADD COLUMN "housingAllowance" INTEGER,
ADD COLUMN "transportationAllowance" INTEGER,
ADD COLUMN "otherAllowances" INTEGER,
ADD COLUMN "annualLeaves" INTEGER,
ADD COLUMN "workingHours" INTEGER,
ADD COLUMN "joiningDate" TIMESTAMP(3);
