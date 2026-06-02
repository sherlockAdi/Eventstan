import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
];

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@eventstan.ae' },
    update: {},
    create: { name: 'EventStan Admin', email: 'admin@eventstan.ae', role: 'SUPER_ADMIN' },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: { name: 'Demo Customer', role: 'CUSTOMER' },
    create: { name: 'Demo Customer', email: 'customer@example.com', role: 'CUSTOMER' },
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
      companyName: 'Luxe Events Dubai',
      contactPerson: 'Aisha Khan',
      phone: '+971500000001',
      status: 'APPROVED',
      cities: ['Dubai', 'Abu Dhabi', 'New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston', 'San Francisco'],
      capacityPerDay: 3,
      commissionPercent: 10,
    },
    create: {
      companyName: 'Luxe Events Dubai',
      contactPerson: 'Aisha Khan',
      email: 'vendor@example.com',
      phone: '+971500000001',
      tradeLicenseNumber: 'DXB-TL-10001',
      vatNumber: '100000000000001',
      status: 'APPROVED',
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
