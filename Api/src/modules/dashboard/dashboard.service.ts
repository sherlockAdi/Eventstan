import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, PaymentStatus, ReviewStatus, VendorStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const [
      totalUsers,
      totalVendors,
      totalBookings,
      pendingVendors,
      pendingServices,
      completedEvents,
      revenue,
      rating,
      recentBookings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.vendor.count(),
      this.prisma.booking.count(),
      this.prisma.vendor.count({ where: { status: VendorStatus.PENDING_VERIFICATION } }),
      this.prisma.vendorService.count({ where: { status: 'DRAFT' } }),
      this.prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCEEDED },
        _sum: { amount: true },
      }),
      this.prisma.review.aggregate({
        where: { status: ReviewStatus.PUBLISHED },
        _avg: { rating: true },
      }),
      this.prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, email: true } },
          items: { take: 1 },
        },
      }),
    ]);

    return {
      data: {
        totalUsers,
        totalVendors,
        totalBookings,
        totalRevenue: revenue._sum.amount ?? 0,
        pendingApprovals: pendingVendors + pendingServices,
        completedEvents,
        avgRating: Number((rating._avg.rating ?? 0).toFixed(1)),
        growth: 0,
      },
      recentBookings: recentBookings.map((booking) => ({
        id: booking.id,
        customer: booking.customer.name,
        customerEmail: booking.customer.email,
        vendorId: booking.items[0]?.vendorId ?? null,
        service: booking.items[0]?.title ?? null,
        amount: booking.totalAmount,
        currency: booking.currency,
        status: booking.status,
        date: booking.createdAt,
      })),
    };
  }

  async getVendor(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    const [totalServices, activeServices, totalPackages, bookings, revenue, recentBookings] =
      await Promise.all([
        this.prisma.vendorService.count({ where: { vendorId: vendor.id } }),
        this.prisma.vendorService.count({ where: { vendorId: vendor.id, status: 'ACTIVE' } }),
        this.prisma.eventPackage.count({ where: { vendorId: vendor.id } }),
        this.prisma.booking.count({ where: { items: { some: { vendorId: vendor.id } } } }),
        this.prisma.payment.aggregate({
          where: {
            status: PaymentStatus.SUCCEEDED,
            booking: { items: { some: { vendorId: vendor.id } } },
          },
          _sum: { amount: true },
        }),
        this.prisma.booking.findMany({
          where: { items: { some: { vendorId: vendor.id } } },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { name: true, email: true } },
            items: { where: { vendorId: vendor.id } },
          },
        }),
      ]);

    return {
      data: {
        vendorId: vendor.id,
        totalServices,
        activeServices,
        totalPackages,
        totalBookings: bookings,
        totalRevenue: revenue._sum.amount ?? 0,
      },
      recentBookings,
    };
  }
}
