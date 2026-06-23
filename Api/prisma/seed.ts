import { Prisma, PrismaClient } from '@prisma/client';
import { randomBytes, scrypt as nodeScrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { DEFAULT_ROLE_PERMISSION_SEEDS } from '../src/modules/role-permission/role-permission.constants';

const prisma = new PrismaClient();
const scrypt = promisify(nodeScrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

const categories = [
  { name: 'Venue', slug: 'venue' },
  { name: 'Decor', slug: 'decor' },
  { name: 'Catering', slug: 'catering' },
  { name: 'Entertainment', slug: 'entertainment' },
  { name: 'Rentals', slug: 'rentals' },
];

const services = [
  {
    categorySlug: 'decor',
    title: 'Bloom & Petal Decorations',
    description:
      'Award-winning floral and event decor specialists. We transform spaces with stunning floral arrangements, lighting, and themed decorations for all occasions.',
    city: 'Los Angeles',
    amount: 800,
    maxAmount: 5000,
    currency: 'USD',
    priceUnit: 'per event',
    imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
    tags: ['Birthday', 'Wedding', 'Proposal', 'Baby Shower'],
    gallery: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80',
    ],
    features: ['Custom floral arrangements', 'Lighting design', 'Table centerpieces', 'Backdrop setup', 'Same-day setup'],
  },
  {
    categorySlug: 'catering',
    title: 'Savory Bites Catering',
    description: 'Premium catering service offering diverse international cuisines. From elegant plated dinners to lavish buffets.',
    city: 'Chicago',
    amount: 45,
    maxAmount: 150,
    currency: 'USD',
    priceUnit: 'per person',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80',
    tags: ['Corporate', 'Wedding', 'Birthday', 'Graduation'],
    gallery: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80'],
    features: ['International cuisine', 'Custom menus', 'Professional staff', 'Bar service', 'Dietary accommodations'],
  },
  {
    categorySlug: 'catering',
    title: 'Royal Feast Banquet Catering',
    description: 'Luxury banquet-style catering with a focus on South Asian, Mediterranean, and fusion cuisines.',
    city: 'Houston',
    amount: 60,
    maxAmount: 200,
    currency: 'USD',
    priceUnit: 'per person',
    imageUrl: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80',
    tags: ['Wedding', 'Corporate', 'Eid', 'Diwali'],
    gallery: ['https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80'],
    features: ['South Asian cuisine', 'Live cooking stations', 'Dessert buffet', 'Halal options', 'Premium tableware'],
  },
  {
    categorySlug: 'entertainment',
    title: 'Electric Vibes DJ & Entertainment',
    description: 'Top-rated DJ and entertainment service bringing the energy to every event. State-of-the-art sound and lighting equipment.',
    city: 'Miami',
    amount: 500,
    maxAmount: 3000,
    currency: 'USD',
    priceUnit: 'per event',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
    tags: ['Birthday', 'Wedding', 'Corporate', 'Festival'],
    gallery: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80'],
    features: ['Professional DJ equipment', 'LED light show', 'Live mixing', 'MC services', 'Custom playlist'],
  },
  {
    categorySlug: 'venue',
    title: 'Sunset Terrace Gardens',
    description:
      'A breathtaking outdoor venue nestled in lush gardens with panoramic sunset views. Ideal for weddings, corporate events, and private parties.',
    city: 'San Francisco',
    amount: 2000,
    maxAmount: 8000,
    currency: 'USD',
    priceUnit: 'per event',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80',
    tags: ['Wedding', 'Corporate', 'Birthday', 'Proposal'],
    gallery: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'],
    features: ['Capacity up to 300 guests', 'Outdoor terrace', 'Bridal suite', 'Parking available', 'In-house catering kitchen'],
  },
  {
    categorySlug: 'venue',
    title: 'The Grand Palace Ballroom',
    description: 'An exquisite ballroom venue with crystal chandeliers, marble floors, and capacity for up to 500 guests. Perfect for grand celebrations.',
    city: 'New York',
    amount: 3000,
    maxAmount: 12000,
    currency: 'USD',
    priceUnit: 'per event',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80',
    tags: ['Wedding', 'Gala', 'Corporate', 'Anniversary'],
    gallery: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'],
    features: ['Capacity up to 500 guests', 'Crystal chandeliers', 'Marble flooring', 'Multiple event rooms', 'Valet parking', 'Audio/visual equipment'],
  },
];

const packages = [
  {
    serviceTitle: 'The Grand Palace Ballroom',
    title: 'Grand Wedding Essentials',
    description: 'Everything you need for a perfect wedding reception',
    amount: 5500,
    inclusions: ['8 hours venue rental', 'Crystal chandelier lighting', 'Bridal suite access', 'Basic floral centerpieces', 'Dedicated event coordinator', 'Setup & cleanup'],
    features: ['8 hours venue rental', 'Crystal chandelier lighting', 'Bridal suite access'],
    maxGuests: 200,
    durationHours: 8,
    isPopular: true,
  },
  {
    serviceTitle: 'The Grand Palace Ballroom',
    title: 'Corporate Gala Package',
    description: 'Professional setup for corporate events and galas',
    amount: 8000,
    inclusions: ['10 hours venue rental', 'AV equipment included', 'Stage and podium setup', 'VIP lounge area', 'Corporate branding options', 'Catering coordination'],
    features: ['10 hours venue rental', 'AV equipment included', 'Stage and podium setup'],
    maxGuests: 400,
    durationHours: 10,
    isPopular: false,
  },
  {
    serviceTitle: 'Bloom & Petal Decorations',
    title: 'Romance in Bloom',
    description: 'Intimate floral setup perfect for proposals and anniversaries',
    amount: 1800,
    inclusions: ['Custom floral arch', 'Rose petal pathway', '10 table centerpieces', 'Ambient candle lighting', 'Personalized signage'],
    features: ['Custom floral arch', 'Rose petal pathway', '10 table centerpieces'],
    maxGuests: 50,
    durationHours: 6,
    isPopular: true,
  },
  {
    serviceTitle: 'Bloom & Petal Decorations',
    title: 'Grand Celebration Decor',
    description: 'Full venue transformation for large-scale events',
    amount: 3500,
    inclusions: ['Full venue floral decor', 'LED backdrop wall', 'Ceiling draping', '20+ table centerpieces', 'Photo booth corner setup', 'Entry arch installation'],
    features: ['Full venue floral decor', 'LED backdrop wall', 'Ceiling draping'],
    maxGuests: 300,
    durationHours: 12,
    isPopular: false,
  },
  {
    serviceTitle: 'Electric Vibes DJ & Entertainment',
    title: 'Neural Entertainment Couple Entry',
    description: 'Couple entry with premium entertainment, snacks, drinks, VIP seating, and professional sound.',
    amount: 800,
    inclusions: ['Snacks Free', 'Unlimited Drinks', 'VIP Seating', 'Professional Sound'],
    features: ['Snacks Free', 'Unlimited Drinks', 'VIP Seating', 'Professional Sound'],
    maxGuests: 400,
    durationHours: 6,
    isPopular: true,
  },
  {
    serviceTitle: 'Sunset Terrace Gardens',
    title: 'Neural Premium Birthday Event',
    description: 'Complete birthday event package with venue essentials, decor, refreshments, and DJ system.',
    amount: 45000,
    inclusions: ['Free Water', 'Free Parking', 'Free Sweets', 'Birthday Decor', 'DJ System'],
    features: ['Free Water', 'Free Parking', 'Free Sweets', 'Birthday Decor', 'DJ System'],
    maxGuests: 50,
    durationHours: 6,
    isPopular: false,
  },
  {
    serviceTitle: 'Sunset Terrace Gardens',
    title: 'Large Frame Marquee (10x20m)',
    description: 'Large waterproof frame marquee for weddings, corporate galas, and festivals.',
    amount: 1200,
    inclusions: ['10x20m frame marquee', 'Waterproof lining', 'Sidewalls included', 'Delivery included', 'Setup crew'],
    features: ['10x20m frame marquee', 'Waterproof lining', 'Sidewalls included'],
    maxGuests: 200,
    durationHours: 24,
    isPopular: false,
  },
  {
    serviceTitle: 'The Grand Palace Ballroom',
    title: 'Grand Ballroom Wedding Special',
    description: 'Wedding package with ballroom access, lighting, valet parking, AV equipment, and event coordination.',
    amount: 8500,
    inclusions: ['Bridal suite access', 'Crystal chandelier lighting', 'Valet parking', 'AV equipment', 'Event coordinator'],
    features: ['Bridal suite access', 'Crystal chandelier lighting', 'Valet parking'],
    maxGuests: 500,
    durationHours: 10,
    isPopular: true,
  },
  {
    serviceTitle: 'Bloom & Petal Decorations',
    title: 'Bloom & Petal Wedding Decor Bundle',
    description: 'Full wedding venue floral transformation with draping, backdrop, and photo booth.',
    amount: 2800,
    inclusions: ['Floral arch & altar', '20+ table centerpieces', 'Ceiling draping', 'LED backdrop', 'Photo booth corner'],
    features: ['Floral arch & altar', '20+ table centerpieces', 'Ceiling draping'],
    maxGuests: 300,
    durationHours: 8,
    isPopular: false,
  },
  {
    serviceTitle: 'Savory Bites Catering',
    title: 'Corporate Gala Catering Package',
    description: 'Multi-cuisine corporate buffet with live stations, dessert spread, and professional waitstaff.',
    amount: 85,
    inclusions: ['Multi-cuisine buffet', 'Live cooking stations', 'Dessert spread', 'Professional waitstaff', 'Table setup'],
    features: ['Multi-cuisine buffet', 'Live cooking stations', 'Dessert spread'],
    maxGuests: 300,
    durationHours: 5,
    isPopular: false,
  },
  {
    serviceTitle: 'Electric Vibes DJ & Entertainment',
    title: 'DJ Night - Festival Package',
    description: 'Festival DJ setup with professional sound, LED light show, MC, and a custom playlist.',
    amount: 2200,
    inclusions: ['Professional DJ system', 'LED light show', 'MC services', 'Custom playlist', 'Setup & breakdown'],
    features: ['Professional DJ system', 'LED light show', 'MC services'],
    maxGuests: 600,
    durationHours: 8,
    isPopular: false,
  },
  {
    serviceTitle: 'Sunset Terrace Gardens',
    title: 'Sunset Garden - Intimate Proposal Setup',
    description: 'Romantic garden proposal setup with flowers, candles, private dining, and photography guidance.',
    amount: 1400,
    inclusions: ['Rose petal pathway', 'Candle arrangement', 'Private dining setup', 'Floral arch', 'Photography guidance'],
    features: ['Rose petal pathway', 'Candle arrangement', 'Private dining setup'],
    maxGuests: 10,
    durationHours: 4,
    isPopular: true,
  },
  {
    serviceTitle: 'Royal Feast Banquet Catering',
    title: 'Royal Feast Baby Shower Bundle',
    description: 'Baby shower catering package with brunch, desserts, mocktails, cake, and themed tableware.',
    amount: 55,
    inclusions: ['Brunch platters', 'Dessert bar', 'Baby cake', 'Mocktails', 'Themed tableware'],
    features: ['Brunch platters', 'Dessert bar', 'Baby cake'],
    maxGuests: 80,
    durationHours: 4,
    isPopular: false,
  },
];

async function main() {
  const adminPasswordHash = await hashPassword(process.env.SEED_ADMIN_PASSWORD ?? 'ChangeAdminPassword123!');
  const customerPasswordHash = await hashPassword(process.env.SEED_CUSTOMER_PASSWORD ?? 'ChangeCustomerPassword123!');
  const vendorPasswordHash = await hashPassword(process.env.SEED_VENDOR_PASSWORD ?? 'ChangeVendorPassword123!');

  await prisma.user.upsert({
    where: { email: 'admin@eventstan.ae' },
    update: { name: 'EventStan Admin', role: 'SUPER_ADMIN', passwordHash: adminPasswordHash, isActive: true },
    create: {
      name: 'EventStan Admin',
      email: 'admin@eventstan.ae',
      role: 'SUPER_ADMIN',
      passwordHash: adminPasswordHash,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: { name: 'Demo Customer', role: 'CUSTOMER', passwordHash: customerPasswordHash, isActive: true },
    create: {
      name: 'Demo Customer',
      email: 'customer@example.com',
      role: 'CUSTOMER',
      passwordHash: customerPasswordHash,
    },
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@eventstan.com' },
    update: { name: 'Aisha Khan', role: 'VENDOR', passwordHash: vendorPasswordHash, isActive: true },
    create: {
      name: 'Aisha Khan',
      email: 'vendor@eventstan.com',
      role: 'VENDOR',
      passwordHash: vendorPasswordHash,
    },
  });

  const categoryBySlug = new Map<string, { id: string }>();
  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, isActive: true },
      create: category,
    });
    categoryBySlug.set(category.slug, row);
  }

  const vendor = await prisma.vendor.upsert({
    where: { email: 'vendor@example.com' },
    update: {
      userId: vendorUser.id,
      companyName: 'Luxe Events Dubai',
      contactPerson: 'Aisha Khan',
      phone: '+971500000001',
      status: 'APPROVED',
      updatedProfile: false,
      cities: ['Dubai', 'Abu Dhabi', 'New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston', 'San Francisco'],
      capacityPerDay: 3,
      commissionPercent: 10,
    },
    create: {
      userId: vendorUser.id,
      companyName: 'Luxe Events Dubai',
      contactPerson: 'Aisha Khan',
      email: 'vendor@example.com',
      phone: '+971500000001',
      tradeLicenseNumber: 'DXB-TL-10001',
      vatNumber: '100000000000001',
      status: 'APPROVED',
      updatedProfile: false,
      cities: ['Dubai', 'Abu Dhabi', 'New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston', 'San Francisco'],
      capacityPerDay: 3,
      commissionPercent: 10,
    },
  });

  const serviceByTitle = new Map<string, { id: string; title: string; amount: number; currency: string }>();
  for (const service of services) {
    const category = categoryBySlug.get(service.categorySlug);
    if (!category) throw new Error(`Missing category: ${service.categorySlug}`);
    const row = await prisma.vendorService.upsert({
      where: { vendorId_title: { vendorId: vendor.id, title: service.title } },
      update: {
        categoryId: category.id,
        description: service.description,
        city: service.city,
        amount: service.amount,
        maxAmount: service.maxAmount,
        currency: service.currency,
        priceUnit: service.priceUnit,
        imageUrl: service.imageUrl,
        tags: service.tags,
        gallery: service.gallery,
        features: service.features,
        status: 'ACTIVE',
      },
      create: {
        vendorId: vendor.id,
        categoryId: category.id,
        title: service.title,
        description: service.description,
        city: service.city,
        amount: service.amount,
        maxAmount: service.maxAmount,
        currency: service.currency,
        priceUnit: service.priceUnit,
        imageUrl: service.imageUrl,
        tags: service.tags,
        gallery: service.gallery,
        features: service.features,
      },
    });
    serviceByTitle.set(service.title, row);
  }

  await prisma.vendorService.updateMany({
    where: {
      vendorId: vendor.id,
      title: { notIn: services.map((service) => service.title) },
    },
    data: { status: 'INACTIVE' },
  });

  for (const eventPackage of packages) {
    const service = serviceByTitle.get(eventPackage.serviceTitle);
    if (!service) throw new Error(`Missing service: ${eventPackage.serviceTitle}`);
    const row = await prisma.eventPackage.upsert({
      where: { vendorId_title: { vendorId: vendor.id, title: eventPackage.title } },
      update: {
        description: eventPackage.description,
        amount: eventPackage.amount,
        currency: 'USD',
        priceUnit: 'package',
        inclusions: eventPackage.inclusions,
        features: eventPackage.features,
        maxGuests: eventPackage.maxGuests,
        durationHours: eventPackage.durationHours,
        isPopular: eventPackage.isPopular,
        status: 'ACTIVE',
      },
      create: {
        vendorId: vendor.id,
        title: eventPackage.title,
        description: eventPackage.description,
        amount: eventPackage.amount,
        currency: 'USD',
        priceUnit: 'package',
        inclusions: eventPackage.inclusions,
        features: eventPackage.features,
        maxGuests: eventPackage.maxGuests,
        durationHours: eventPackage.durationHours,
        isPopular: eventPackage.isPopular,
      },
    });
    await prisma.packageItem.upsert({
      where: { packageId_serviceId: { packageId: row.id, serviceId: service.id } },
      update: {},
      create: { packageId: row.id, serviceId: service.id },
    });
  }

  await prisma.eventPackage.updateMany({
    where: {
      vendorId: vendor.id,
      title: { notIn: packages.map((eventPackage) => eventPackage.title) },
    },
    data: { status: 'INACTIVE' },
  });

  await prisma.vendorAvailability.upsert({
    where: { vendorId_date: { vendorId: vendor.id, date: new Date('2026-06-15') } },
    update: { status: 'AVAILABLE', capacity: 3, note: 'Open for online booking' },
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
    update: { active: true, expiresAt: new Date('2026-12-31') },
    create: {
      code: 'EVENT10',
      type: 'PERCENTAGE',
      value: 10,
      maxDiscountAmount: 500,
      currency: 'USD',
      minOrderAmount: 5000,
      expiresAt: new Date('2026-12-31'),
    },
  });

  const reviewService = serviceByTitle.get('The Grand Palace Ballroom');
  if (reviewService) {
    const booking = await prisma.booking.upsert({
      where: { id: 'seed_booking_review_1' },
      update: {
        status: 'COMPLETED',
        eventAddress: 'New York',
        subtotalAmount: reviewService.amount,
        totalAmount: reviewService.amount,
        advanceDueAmount: Math.round(reviewService.amount / 2),
        remainingDueAmount: Math.round(reviewService.amount / 2),
        currency: reviewService.currency,
      },
      create: {
        id: 'seed_booking_review_1',
        customerId: customer.id,
        status: 'COMPLETED',
        eventAddress: 'New York',
        notes: 'Seed review booking',
        subtotalAmount: reviewService.amount,
        totalAmount: reviewService.amount,
        advanceDueAmount: Math.round(reviewService.amount / 2),
        remainingDueAmount: Math.round(reviewService.amount / 2),
        currency: reviewService.currency,
      },
    });
    await prisma.bookingItem.deleteMany({ where: { bookingId: booking.id } });
    await prisma.bookingItem.create({
      data: {
        bookingId: booking.id,
        vendorId: vendor.id,
        type: 'SERVICE',
        itemId: reviewService.id,
        title: reviewService.title,
        eventDate: new Date('2026-06-15'),
        quantity: 1,
        unitAmount: reviewService.amount,
        currency: reviewService.currency,
      },
    });
    await prisma.review.upsert({
      where: { bookingId_customerId: { bookingId: booking.id, customerId: customer.id } },
      update: {
        vendorId: vendor.id,
        rating: 5,
        comment: 'EventStan made our dream wedding a reality. Finding our venue and decorator in one place saved us so much stress.',
        status: 'PUBLISHED',
        approvedAt: new Date(),
      },
      create: {
        bookingId: booking.id,
        vendorId: vendor.id,
        customerId: customer.id,
        rating: 5,
        comment: 'EventStan made our dream wedding a reality. Finding our venue and decorator in one place saved us so much stress.',
        status: 'PUBLISHED',
        approvedAt: new Date(),
      },
    });
  }

  for (const roleSeed of DEFAULT_ROLE_PERMISSION_SEEDS) {
    await prisma.rolePermission.upsert({
      where: { role: roleSeed.role },
      update: {
        name: roleSeed.name,
        description: roleSeed.description,
        isActive: roleSeed.isActive,
        permissions: roleSeed.permissions as unknown as Prisma.InputJsonValue,
      },
      create: {
        role: roleSeed.role,
        name: roleSeed.name,
        description: roleSeed.description,
        isActive: roleSeed.isActive,
        permissions: roleSeed.permissions as unknown as Prisma.InputJsonValue,
      },
    });
  }

  console.log({
    customer: customer.email,
    vendor: vendor.email,
    services: services.length,
    packages: packages.length,
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
