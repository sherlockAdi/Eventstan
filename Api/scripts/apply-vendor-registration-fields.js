const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const statements = [
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "about" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "firstName" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "lastName" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "userName" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "primaryEmail" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "telephone" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "primaryMobile" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "specialization" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "businessLocation" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "visaType" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "address" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "planDetails" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "planExpiry" TIMESTAMP(3)',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "agreementFileUrl" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "agreementFileKey" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "bankName" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "accountFullName" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "ibanNo" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "swift" TEXT',
  'ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "branchAddress" TEXT',
  'CREATE UNIQUE INDEX IF NOT EXISTS "vendors_userName_key" ON "vendors"("userName")',
];

async function main() {
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
  console.log('vendor columns applied');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
