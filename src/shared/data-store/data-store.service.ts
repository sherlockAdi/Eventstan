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
    { id: 'cat_wedding', name: 'Wedding', slug: 'wedding' },
    { id: 'cat_corporate', name: 'Corporate Event', slug: 'corporate-event' },
    { id: 'cat_birthday', name: 'Birthday', slug: 'birthday' },
  ];

  services = [
    {
      id: 'svc_decoration',
      vendorId: 'ven_luxe_events',
      categoryId: 'cat_wedding',
      title: 'Luxury Wedding Decoration',
      description: 'Premium wedding stage, floral entry, lighting, and table decor.',
      city: 'Dubai',
      price: { amount: 25000, currency: 'AED' },
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
      id: 'pkg_gold_wedding',
      vendorId: 'ven_luxe_events',
      title: 'Gold Wedding Package',
      description: 'Decoration, photography, and catering coordination for premium weddings.',
      itemIds: ['svc_decoration'],
      price: { amount: 55000, currency: 'AED' },
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
  reviews: any[] = [];
  settlements: any[] = [];

  nextId(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
