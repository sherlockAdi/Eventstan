import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventstan.ae' },
    update: {},
    create: {
      name: 'EventStan Admin',
      email: 'admin@eventstan.ae',
      role: 'SUPER_ADMIN',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Demo Customer',
      email: 'customer@example.com',
      role: 'CUSTOMER',
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: 'wedding' },
    update: {},
    create: {
      name: 'Wedding',
      slug: 'wedding',
    },
  });

  const vendor = await prisma.vendor.upsert({
    where: { email: 'vendor@example.com' },
    update: {},
    create: {
      companyName: 'Luxe Events Dubai',
      contactPerson: 'Aisha Khan',
      email: 'vendor@example.com',
      phone: '+971500000001',
      tradeLicenseNumber: 'DXB-TL-10001',
      vatNumber: '100000000000001',
      status: 'APPROVED',
      cities: ['Dubai', 'Abu Dhabi'],
      capacityPerDay: 3,
      commissionPercent: 10,
    },
  });

  const service = await prisma.vendorService.upsert({
    where: {
      vendorId_title: {
        vendorId: vendor.id,
        title: 'Luxury Wedding Decoration',
      },
    },
    update: {},
    create: {
      vendorId: vendor.id,
      categoryId: category.id,
      title: 'Luxury Wedding Decoration',
      description: 'Premium wedding stage, floral entry, lighting, and table decor.',
      city: 'Dubai',
      amount: 25000,
      currency: 'AED',
    },
  });

  const eventPackage = await prisma.eventPackage.upsert({
    where: {
      vendorId_title: {
        vendorId: vendor.id,
        title: 'Gold Wedding Package',
      },
    },
    update: {},
    create: {
      vendorId: vendor.id,
      title: 'Gold Wedding Package',
      description: 'Decoration, photography, and catering coordination for premium weddings.',
      amount: 55000,
      currency: 'AED',
      items: {
        create: [{ serviceId: service.id }],
      },
    },
  });

  await prisma.vendorAvailability.upsert({
    where: {
      vendorId_date: {
        vendorId: vendor.id,
        date: new Date('2026-06-15'),
      },
    },
    update: {},
    create: {
      vendorId: vendor.id,
      date: new Date('2026-06-15'),
      status: 'AVAILABLE',
      capacity: 3,
      note: 'Open for online booking',
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'EVENT10' },
    update: {},
    create: {
      code: 'EVENT10',
      type: 'PERCENTAGE',
      value: 10,
      maxDiscountAmount: 500,
      currency: 'AED',
      minOrderAmount: 5000,
      expiresAt: new Date('2026-12-31'),
    },
  });

  console.log({
    admin: admin.email,
    customer: customer.email,
    category: category.slug,
    vendor: vendor.email,
    service: service.id,
    package: eventPackage.id,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
