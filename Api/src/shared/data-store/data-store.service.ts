import { Injectable } from '@nestjs/common';

export type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER' | 'AFFILIATE';
export type VendorStatus = 'PENDING_VERIFICATION' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
export type BookingStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_RECEIVED'
  | 'VENDOR_REVIEW'
  | 'VENDOR_ACCEPTED'
  | 'CUSTOMER_CONFIRMATION'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Money {
  amount: number;
  currency: string;
}

@Injectable()
export class DataStoreService {
  users = [
    { id: 'usr_admin', name: 'EventStan Admin', email: 'admin@eventstan.ae', role: 'ADMIN' as UserRole },
    { id: 'usr_customer', name: 'Demo Customer', email: 'customer@example.com', role: 'CUSTOMER' as UserRole },
  ];

  vendors = [
    {
      id: 'ven_luxe_events',
      companyName: 'Luxe Events Dubai',
      contactPerson: 'Aisha Khan',
      email: 'vendor@example.com',
      phone: '+971500000001',
      status: 'APPROVED' as VendorStatus,
      tradeLicenseNumber: 'DXB-TL-10001',
      vatNumber: '100000000000001',
      cities: ['Dubai', 'Abu Dhabi'],
      capacityPerDay: 3,
      commissionPercent: 10,
    },
  ];

  categories = [
    { id: 'cat_venue', name: 'Venue', slug: 'venue' },
    { id: 'cat_decor', name: 'Decor', slug: 'decor' },
    { id: 'cat_catering', name: 'Catering', slug: 'catering' },
    { id: 'cat_entertainment', name: 'Entertainment', slug: 'entertainment' },
    { id: 'cat_rentals', name: 'Rentals', slug: 'rentals' },
  ];

  services = [
    {
      id: '1',
      vendorId: 'ven_luxe_events',
      categoryId: 'cat_decor',
      title: 'Bloom & Petal Decorations',
      category: 'Decor',
      description: 'Award-winning floral and event decor specialists. We transform spaces with stunning floral arrangements, lighting, and themed decorations for all occasions.',
      city: 'Los Angeles',
      location: 'Los Angeles',
      price: { amount: 800, currency: 'USD' },
      price_min: 800,
      price_max: 5000,
      price_unit: 'per event',
      rating: 4.9,
      review_count: 124,
      image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
      vendor_name: 'Sarah Johnson',
      vendor_email: 'sarah@bloomandpetal.com',
      vendor_phone: '+1 (555) 234-5678',
      tags: ['Birthday', 'Wedding', 'Proposal', 'Baby Shower'],
      gallery: [
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80',
      ],
      features: ['Custom floral arrangements', 'Lighting design', 'Table centerpieces', 'Backdrop setup', 'Same-day setup'],
      created_at: '2024-01-15',
      status: 'ACTIVE',
    },
    {
      id: '2',
      vendorId: 'ven_luxe_events',
      categoryId: 'cat_catering',
      title: 'Savory Bites Catering',
      category: 'Catering',
      description: 'Premium catering service offering diverse international cuisines. From elegant plated dinners to lavish buffets.',
      city: 'Chicago',
      location: 'Chicago',
      price: { amount: 45, currency: 'USD' },
      price_min: 45,
      price_max: 150,
      price_unit: 'per person',
      rating: 4.7,
      review_count: 89,
      image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80',
      vendor_name: 'Marco Rossi',
      vendor_email: 'marco@savorybites.com',
      vendor_phone: '+1 (555) 345-6789',
      tags: ['Corporate', 'Wedding', 'Birthday', 'Graduation'],
      gallery: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80'],
      features: ['International cuisine', 'Custom menus', 'Professional staff', 'Bar service', 'Dietary accommodations'],
      created_at: '2024-02-01',
      status: 'ACTIVE',
    },
    {
      id: '3',
      vendorId: 'ven_luxe_events',
      categoryId: 'cat_catering',
      title: 'Royal Feast Banquet Catering',
      category: 'Catering',
      description: 'Luxury banquet-style catering with a focus on South Asian, Mediterranean, and fusion cuisines.',
      city: 'Houston',
      location: 'Houston',
      price: { amount: 60, currency: 'USD' },
      price_min: 60,
      price_max: 200,
      price_unit: 'per person',
      rating: 4.8,
      review_count: 67,
      image_url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80',
      vendor_name: 'Aisha Rahman',
      vendor_email: 'aisha@royalfeast.com',
      vendor_phone: '+1 (555) 456-7890',
      tags: ['Wedding', 'Corporate', 'Eid', 'Diwali'],
      gallery: ['https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80'],
      features: ['South Asian cuisine', 'Live cooking stations', 'Dessert buffet', 'Halal options', 'Premium tableware'],
      created_at: '2024-02-10',
      status: 'ACTIVE',
    },
    {
      id: '4',
      vendorId: 'ven_luxe_events',
      categoryId: 'cat_entertainment',
      title: 'Electric Vibes DJ & Entertainment',
      category: 'Entertainment',
      description: 'Top-rated DJ and entertainment service bringing the energy to every event. State-of-the-art sound and lighting equipment.',
      city: 'Miami',
      location: 'Miami',
      price: { amount: 500, currency: 'USD' },
      price_min: 500,
      price_max: 3000,
      price_unit: 'per event',
      rating: 4.6,
      review_count: 203,
      image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
      vendor_name: 'DJ Marcus',
      vendor_email: 'marcus@electricvibes.com',
      vendor_phone: '+1 (555) 567-8901',
      tags: ['Birthday', 'Wedding', 'Corporate', 'Festival'],
      gallery: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80'],
      features: ['Professional DJ equipment', 'LED light show', 'Live mixing', 'MC services', 'Custom playlist'],
      created_at: '2024-01-20',
      status: 'ACTIVE',
    },
    {
      id: '5',
      vendorId: 'ven_luxe_events',
      categoryId: 'cat_venue',
      title: 'Sunset Terrace Gardens',
      category: 'Venue',
      description: 'A breathtaking outdoor venue nestled in lush gardens with panoramic sunset views. Ideal for weddings, corporate events, and private parties.',
      city: 'San Francisco',
      location: 'San Francisco',
      price: { amount: 2000, currency: 'USD' },
      price_min: 2000,
      price_max: 8000,
      price_unit: 'per event',
      rating: 4.9,
      review_count: 156,
      image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80',
      vendor_name: 'Elena Vasquez',
      vendor_email: 'elena@sunsetterrace.com',
      vendor_phone: '+1 (555) 678-9012',
      tags: ['Wedding', 'Corporate', 'Birthday', 'Proposal'],
      gallery: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'],
      features: ['Capacity up to 300 guests', 'Outdoor terrace', 'Bridal suite', 'Parking available', 'In-house catering kitchen'],
      created_at: '2024-01-05',
      status: 'ACTIVE',
    },
    {
      id: '6',
      vendorId: 'ven_luxe_events',
      categoryId: 'cat_venue',
      title: 'The Grand Palace Ballroom',
      category: 'Venue',
      description: 'An exquisite ballroom venue with crystal chandeliers, marble floors, and capacity for up to 500 guests. Perfect for grand celebrations.',
      city: 'New York',
      location: 'New York',
      price: { amount: 3000, currency: 'USD' },
      price_min: 3000,
      price_max: 12000,
      price_unit: 'per event',
      rating: 4.8,
      review_count: 198,
      image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80',
      vendor_name: 'Grand Palace Events',
      vendor_email: 'events@grandpalace.com',
      vendor_phone: '+1 (555) 789-0123',
      tags: ['Wedding', 'Gala', 'Corporate', 'Anniversary'],
      gallery: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'],
      features: ['Capacity up to 500 guests', 'Crystal chandeliers', 'Marble flooring', 'Multiple event rooms', 'Valet parking', 'Audio/visual equipment'],
      created_at: '2024-01-01',
      status: 'ACTIVE',
    },
  ];

  subServices = [
    {
      id: 'subsvc_floral_entry',
      serviceId: 'svc_decoration',
      title: 'Premium Floral Entry',
      description: 'Fresh flower arch, aisle markers, and entrance styling.',
      price: { amount: 7500, currency: 'AED' },
      status: 'ACTIVE',
    },
    {
      id: 'subsvc_stage_lighting',
      serviceId: 'svc_decoration',
      title: 'Stage Lighting Upgrade',
      description: 'Warm stage wash, moving heads, and ambient venue lighting.',
      price: { amount: 5000, currency: 'AED' },
      status: 'ACTIVE',
    },
  ];

  packages = [
    {
      id: 'p1',
      vendorId: 'ven_luxe_events',
      service_id: '6',
      title: 'Grand Wedding Essentials',
      name: 'Grand Wedding Essentials',
      description: 'Everything you need for a perfect wedding reception',
      itemIds: ['6'],
      price: 5500,
      money: { amount: 5500, currency: 'USD' },
      inclusions: ['8 hours venue rental', 'Crystal chandelier lighting', 'Bridal suite access', 'Basic floral centerpieces', 'Dedicated event coordinator', 'Setup & cleanup'],
      features: ['8 hours venue rental', 'Crystal chandelier lighting', 'Bridal suite access'],
      max_guests: 200,
      duration_hours: 8,
      price_unit: 'package',
      is_popular: true,
      status: 'ACTIVE',
    },
    {
      id: 'p2',
      vendorId: 'ven_luxe_events',
      service_id: '6',
      title: 'Corporate Gala Package',
      name: 'Corporate Gala Package',
      description: 'Professional setup for corporate events and galas',
      itemIds: ['6'],
      price: 8000,
      money: { amount: 8000, currency: 'USD' },
      inclusions: ['10 hours venue rental', 'AV equipment included', 'Stage and podium setup', 'VIP lounge area', 'Corporate branding options', 'Catering coordination'],
      features: ['10 hours venue rental', 'AV equipment included', 'Stage and podium setup'],
      max_guests: 400,
      duration_hours: 10,
      price_unit: 'package',
      status: 'ACTIVE',
    },
    {
      id: 'p3',
      vendorId: 'ven_luxe_events',
      service_id: '1',
      title: 'Romance in Bloom',
      name: 'Romance in Bloom',
      description: 'Intimate floral setup perfect for proposals and anniversaries',
      itemIds: ['1'],
      price: 1800,
      money: { amount: 1800, currency: 'USD' },
      inclusions: ['Custom floral arch', 'Rose petal pathway', '10 table centerpieces', 'Ambient candle lighting', 'Personalized signage'],
      features: ['Custom floral arch', 'Rose petal pathway', '10 table centerpieces'],
      max_guests: 50,
      duration_hours: 6,
      price_unit: 'package',
      is_popular: true,
      status: 'ACTIVE',
    },
    {
      id: 'p4',
      vendorId: 'ven_luxe_events',
      service_id: '1',
      title: 'Grand Celebration Decor',
      name: 'Grand Celebration Decor',
      description: 'Full venue transformation for large-scale events',
      itemIds: ['1'],
      price: 3500,
      money: { amount: 3500, currency: 'USD' },
      inclusions: ['Full venue floral decor', 'LED backdrop wall', 'Ceiling draping', '20+ table centerpieces', 'Photo booth corner setup', 'Entry arch installation'],
      features: ['Full venue floral decor', 'LED backdrop wall', 'Ceiling draping'],
      max_guests: 300,
      duration_hours: 12,
      price_unit: 'package',
      status: 'ACTIVE',
    },
  ];

  availability = [
    {
      id: 'avl_1',
      vendorId: 'ven_luxe_events',
      date: '2026-06-15',
      status: 'AVAILABLE',
      capacity: 3,
      bookedCount: 0,
      note: 'Open for online booking',
    },
  ];

  carts: Record<string, Array<{ id: string; type: 'SERVICE' | 'PACKAGE'; itemId: string; eventDate: string; quantity: number }>> = {};
  bookings: any[] = [];
  payments: any[] = [];
  refunds: any[] = [];
  coupons = [
    {
      id: 'cpn_event10',
      code: 'EVENT10',
      type: 'PERCENTAGE',
      value: 10,
      maxDiscountAmount: 500,
      currency: 'AED',
      minOrderAmount: 5000,
      active: true,
      expiresAt: '2026-12-31',
    },
  ];
  reviews: any[] = [
    {
      id: 'r1',
      service_id: '6',
      reviewer_name: 'Priya & Arjun Sharma',
      reviewer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
      rating: 5,
      comment: 'EventStan made our dream wedding a reality. Finding our venue and decorator in one place saved us so much stress. The Grand Palace Ballroom was absolutely breathtaking!',
      event_type: 'Wedding',
      location: 'New York',
      created_at: '2024-03-15',
      status: 'PUBLISHED',
    },
    {
      id: 'r2',
      service_id: '2',
      reviewer_name: 'James Whitfield',
      reviewer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
      rating: 5,
      comment: 'We hosted our annual company gala through EventStan and the experience was seamless. The vendors were professional, responsive, and delivered beyond expectations.',
      event_type: 'Corporate Gala',
      location: 'Chicago',
      created_at: '2024-02-28',
      status: 'PUBLISHED',
    },
    {
      id: 'r3',
      service_id: '4',
      reviewer_name: 'Sofia Martinez',
      reviewer_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
      rating: 5,
      comment: 'From the catering to the entertainment, every detail was perfect. The checkout process was simple and the vendor kept in touch throughout. Highly recommend EventStan!',
      event_type: 'Birthday Party',
      location: 'Miami',
      created_at: '2024-03-01',
      status: 'PUBLISHED',
    },
    {
      id: 'r4',
      service_id: '1',
      reviewer_name: 'David & Keiko Chen',
      reviewer_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
      rating: 5,
      comment: 'The Bloom & Petal decorations team transformed our venue into something magical. Sarah was incredibly professional and creative. Worth every penny!',
      event_type: 'Anniversary Dinner',
      location: 'LA',
      created_at: '2024-02-14',
      status: 'PUBLISHED',
    },
  ];
  settlements: any[] = [];

  nextId(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
