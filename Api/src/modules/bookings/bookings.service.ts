import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, CartItemType, CouponType, Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { AvailabilityService } from '../availability/availability.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: AvailabilityService,
  ) {}

  async createFromCart(dto: CreateBookingDto & { customerId: string }) {
    return this.prisma.$transaction(
      async (tx) => {
        const customer = await tx.user.findUnique({ where: { id: dto.customerId } });
        if (!customer || customer.role !== 'CUSTOMER') throw new NotFoundException('Customer not found');

        const cart = await tx.cart.findUnique({
          where: { customerId: dto.customerId },
          include: { items: true },
        });
        if (!cart?.items.length) throw new BadRequestException('Cart is empty');

        const normalizedItems = [];
        for (const cartItem of cart.items) {
          const item =
            cartItem.type === CartItemType.SERVICE
              ? await tx.vendorService.findUnique({ where: { id: cartItem.itemId } })
              : await tx.eventPackage.findUnique({ where: { id: cartItem.itemId } });
          if (!item) throw new NotFoundException(`Cart item not found: ${cartItem.itemId}`);
          if (item.status !== 'ACTIVE') throw new BadRequestException(`${item.title} is not available`);

          await this.availability.reserve(item.vendorId, cartItem.eventDate.toISOString(), tx);
          normalizedItems.push({
            vendorId: item.vendorId,
            type: cartItem.type,
            itemId: item.id,
            title: item.title,
            eventDate: cartItem.eventDate,
            quantity: cartItem.quantity,
            unitAmount: item.amount,
            currency: item.currency,
          });
        }

        const currencies = new Set(normalizedItems.map((item) => item.currency));
        if (currencies.size !== 1) throw new BadRequestException('Cart items must use the same currency');
        const currency = normalizedItems[0].currency;
        const subtotalAmount = normalizedItems.reduce(
          (sum, item) => sum + item.unitAmount * item.quantity,
          0,
        );
        const coupon = dto.couponCode
          ? await tx.coupon.findFirst({ where: { code: dto.couponCode, active: true } })
          : null;
        const discountAmount = this.discount(coupon, subtotalAmount, currency);
        const totalAmount = Math.max(0, subtotalAmount - discountAmount);
        const advanceDueAmount = Math.round(totalAmount * 0.5);

        const booking = await tx.booking.create({
          data: {
            customerId: dto.customerId,
            status: BookingStatus.PENDING_PAYMENT,
            eventAddress: dto.eventAddress,
            notes: dto.notes,
            couponCode: coupon?.code,
            subtotalAmount,
            discountAmount,
            totalAmount,
            advanceDueAmount,
            remainingDueAmount: totalAmount - advanceDueAmount,
            currency,
            items: { create: normalizedItems },
          },
          include: this.bookingInclude,
        });

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        return booking;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findAll(status?: BookingStatus, customerId?: string, vendorId?: string) {
    return this.prisma.booking.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
        ...(vendorId ? { items: { some: { vendorId } } } : {}),
      },
      include: this.bookingInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForUser(user: AuthenticatedUser, status?: BookingStatus) {
    if (user.role === 'CUSTOMER') return this.findAll(status, user.id);
    if (user.role === 'VENDOR') return this.findAll(status, undefined, await this.vendorId(user.id));
    return this.findAll(status);
  }

  async findAccessible(user: AuthenticatedUser, id: string) {
    const booking = await this.findOne(id);
    await this.assertAccess(user, booking);
    return booking;
  }

  async estimateRefundForUser(user: AuthenticatedUser, id: string) {
    const booking = await this.findAccessible(user, id);
    const cancelledBy = user.role === 'CUSTOMER' ? 'CUSTOMER' : user.role === 'VENDOR' ? 'VENDOR' : 'ADMIN';
    return this.estimateRefund(booking.id, cancelledBy);
  }

  async cancelForUser(user: AuthenticatedUser, id: string, dto: CancelBookingDto) {
    await this.findAccessible(user, id);
    const cancelledBy = user.role === 'CUSTOMER' ? 'CUSTOMER' : user.role === 'VENDOR' ? 'VENDOR' : 'ADMIN';
    return this.cancel(id, { ...dto, cancelledBy });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: this.bookingInclude,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async markPaymentReceived(id: string) {
    await this.findOne(id);
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.VENDOR_REVIEW },
      include: this.bookingInclude,
    });
  }

  async vendorAccept(id: string) {
    const booking = await this.findOne(id);
    if (booking.status !== BookingStatus.VENDOR_REVIEW) {
      throw new BadRequestException('Booking is not waiting for vendor review');
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CUSTOMER_CONFIRMATION, vendorAcceptedAt: new Date() },
      include: this.bookingInclude,
    });
  }

  async vendorReject(id: string) {
    const booking = await this.findOne(id);
    if (booking.status !== BookingStatus.VENDOR_REVIEW && booking.status !== BookingStatus.PAYMENT_RECEIVED) {
      throw new BadRequestException('Booking cannot be rejected in its current state');
    }
    return this.prisma.$transaction(async (tx) => {
      await this.releaseCapacity(booking.items, tx);
      await tx.refund.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          currency: booking.currency,
          refundPercent: 100,
          reason: 'Vendor rejected booking',
        },
      });
      return tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.REFUNDED,
          cancelledAt: new Date(),
          cancelReason: 'Vendor rejected booking',
        },
        include: this.bookingInclude,
      });
    });
  }

  async customerConfirm(id: string) {
    const booking = await this.findOne(id);
    if (booking.status !== BookingStatus.CUSTOMER_CONFIRMATION) {
      throw new BadRequestException('Booking is not waiting for customer confirmation');
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED, customerConfirmedAt: new Date() },
      include: this.bookingInclude,
    });
  }

  async complete(id: string) {
    const booking = await this.findOne(id);
    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Only confirmed or in-progress bookings can be completed');
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.COMPLETED, completedAt: new Date() },
      include: this.bookingInclude,
    });
  }

  async cancel(id: string, dto: CancelBookingDto) {
    const booking = await this.findOne(id);
    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.REFUNDED
    ) {
      throw new BadRequestException('Booking cannot be cancelled in its current state');
    }
    const policy = await this.estimateRefund(id, dto.cancelledBy);

    return this.prisma.$transaction(async (tx) => {
      await this.releaseCapacity(booking.items, tx);
      if (policy.refundAmount > 0) {
        await tx.refund.create({
          data: {
            bookingId: id,
            amount: policy.refundAmount,
            currency: booking.currency,
            refundPercent: policy.refundPercent,
            reason: dto.reason || policy.reason || 'Booking cancelled',
          },
        });
      }
      return tx.booking.update({
        where: { id },
        data: {
          status: policy.refundAmount > 0 ? BookingStatus.REFUNDED : BookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: dto.reason,
        },
        include: this.bookingInclude,
      });
    });
  }

  async estimateRefund(id: string, cancelledBy = 'CUSTOMER') {
    const booking = await this.findOne(id);
    if (cancelledBy === 'VENDOR') {
      return { refundPercent: 100, refundAmount: booking.totalAmount, penaltyRequired: true };
    }
    if (
      booking.status === BookingStatus.PENDING_PAYMENT ||
      booking.status === BookingStatus.VENDOR_REVIEW ||
      booking.status === BookingStatus.PAYMENT_RECEIVED
    ) {
      return {
        refundPercent: 100,
        refundAmount: booking.totalAmount,
        reason: 'Vendor has not accepted yet',
      };
    }

    const eventDate = booking.items[0]?.eventDate;
    if (!eventDate) throw new BadRequestException('Booking has no event date');
    const daysBeforeEvent = Math.ceil((eventDate.getTime() - Date.now()) / 86_400_000);
    const refundPercent = daysBeforeEvent >= 30 ? 90 : daysBeforeEvent >= 15 ? 70 : daysBeforeEvent >= 7 ? 50 : 0;
    return {
      daysBeforeEvent,
      refundPercent,
      refundAmount: Math.round((booking.totalAmount * refundPercent) / 100),
      currency: booking.currency,
    };
  }

  private readonly bookingInclude = {
    customer: { select: { id: true, name: true, email: true, phone: true } },
    items: true,
    payments: true,
    refunds: true,
  };

  private discount(
    coupon: { type: CouponType; value: number; maxDiscountAmount: number | null; minOrderAmount: number; currency: string; expiresAt: Date | null } | null,
    subtotal: number,
    currency: string,
  ) {
    if (!coupon) return 0;
    if (coupon.currency !== currency) throw new BadRequestException('Coupon currency does not match cart');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Coupon expired');
    if (subtotal < coupon.minOrderAmount) throw new BadRequestException('Minimum coupon order amount not reached');
    return coupon.type === CouponType.PERCENTAGE
      ? Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscountAmount ?? subtotal)
      : Math.min(coupon.value, subtotal);
  }

  private async releaseCapacity(items: Array<{ vendorId: string; eventDate: Date }>, tx: Prisma.TransactionClient) {
    for (const item of items) await this.availability.release(item.vendorId, item.eventDate, tx);
  }

  private async vendorId(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor.id;
  }

  private async assertAccess(
    user: AuthenticatedUser,
    booking: Awaited<ReturnType<BookingsService['findOne']>>,
  ) {
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return;
    if (user.role === 'CUSTOMER' && booking.customerId === user.id) return;
    if (user.role === 'VENDOR') {
      const vendorId = await this.vendorId(user.id);
      if (booking.items.some((item) => item.vendorId === vendorId)) return;
    }
    throw new BadRequestException('Booking is not accessible to this account');
  }
}
