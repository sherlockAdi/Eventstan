import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityService } from '../availability/availability.service';
import { CartService } from '../cart/cart.service';
import { BookingStatus, DataStoreService } from '../../shared/data-store/data-store.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly store: DataStoreService,
    private readonly cart: CartService,
    private readonly availability: AvailabilityService,
  ) {}

  createFromCart(dto: CreateBookingDto) {
    const cart = this.cart.getCart(dto.customerId);
    if (cart.items.length === 0) throw new BadRequestException('Cart is empty');

    const normalizedItems = cart.items.map((cartItem) => {
      const item = cartItem.type === 'SERVICE'
        ? this.store.services.find((service) => service.id === cartItem.itemId)
        : this.store.packages.find((pkg) => pkg.id === cartItem.itemId);
      if (!item) throw new NotFoundException(`Cart item not found: ${cartItem.itemId}`);
      if (!this.availability.canBook(item.vendorId, cartItem.eventDate)) {
        throw new BadRequestException(`Vendor ${item.vendorId} is not available on ${cartItem.eventDate}`);
      }
      return { ...cartItem, vendorId: item.vendorId, title: item.title, unitPrice: item.price };
    });

    normalizedItems.forEach((item) => this.availability.reserve(item.vendorId, item.eventDate));
    const subtotal = normalizedItems.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);
    const coupon = dto.couponCode ? this.store.coupons.find((item) => item.code === dto.couponCode && item.active) : undefined;
    const discountAmount = coupon ? Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscountAmount) : 0;
    const totalAmount = subtotal - discountAmount;
    const advanceAmount = Math.round(totalAmount * 0.5);

    const booking = {
      id: this.store.nextId('bkg'),
      customerId: dto.customerId,
      status: 'PENDING_PAYMENT' as BookingStatus,
      eventAddress: dto.eventAddress,
      notes: dto.notes,
      couponCode: dto.couponCode,
      items: normalizedItems,
      subtotal: { amount: subtotal, currency: 'AED' },
      discount: { amount: discountAmount, currency: 'AED' },
      total: { amount: totalAmount, currency: 'AED' },
      advanceDue: { amount: advanceAmount, currency: 'AED' },
      remainingDue: { amount: totalAmount - advanceAmount, currency: 'AED' },
      createdAt: new Date().toISOString(),
    };

    this.store.bookings.push(booking);
    this.cart.clear(dto.customerId);
    return booking;
  }

  findAll(status?: BookingStatus) {
    return status ? this.store.bookings.filter((booking) => booking.status === status) : this.store.bookings;
  }

  findOne(id: string) {
    const booking = this.store.bookings.find((item) => item.id === id);
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  markPaymentReceived(id: string) {
    const booking = this.findOne(id);
    booking.status = 'VENDOR_REVIEW';
    return booking;
  }

  vendorAccept(id: string) {
    const booking = this.findOne(id);
    if (booking.status !== 'VENDOR_REVIEW') throw new BadRequestException('Booking is not waiting for vendor review');
    booking.status = 'CUSTOMER_CONFIRMATION';
    booking.vendorAcceptedAt = new Date().toISOString();
    return booking;
  }

  vendorReject(id: string) {
    const booking = this.findOne(id);
    booking.status = 'REFUNDED';
    booking.vendorRejectedAt = new Date().toISOString();
    booking.refundPolicy = { refundPercent: 100, reason: 'Vendor rejected booking' };
    return booking;
  }

  customerConfirm(id: string) {
    const booking = this.findOne(id);
    if (booking.status !== 'CUSTOMER_CONFIRMATION') throw new BadRequestException('Booking is not waiting for customer confirmation');
    booking.status = 'CONFIRMED';
    booking.customerConfirmedAt = new Date().toISOString();
    return booking;
  }

  complete(id: string) {
    const booking = this.findOne(id);
    booking.status = 'COMPLETED';
    booking.completedAt = new Date().toISOString();
    return booking;
  }

  cancel(id: string, dto: CancelBookingDto) {
    const booking = this.findOne(id);
    const refundPolicy = this.estimateRefund(id, dto.cancelledBy);
    booking.status = refundPolicy.refundPercent > 0 ? 'REFUNDED' : 'CANCELLED';
    booking.cancelledBy = dto.cancelledBy;
    booking.cancelReason = dto.reason;
    booking.cancelledAt = new Date().toISOString();
    booking.refundPolicy = refundPolicy;
    return booking;
  }

  estimateRefund(id: string, cancelledBy = 'CUSTOMER') {
    const booking = this.findOne(id);
    if (cancelledBy === 'VENDOR') return { refundPercent: 100, refundAmount: booking.total, penaltyRequired: true };
    if (booking.status === 'PENDING_PAYMENT' || booking.status === 'VENDOR_REVIEW') {
      return { refundPercent: 100, refundAmount: booking.total, reason: 'Vendor has not accepted yet' };
    }
    const eventDate = new Date(booking.items[0].eventDate);
    const today = new Date();
    const daysBeforeEvent = Math.ceil((eventDate.getTime() - today.getTime()) / 86_400_000);
    const refundPercent = daysBeforeEvent >= 30 ? 90 : daysBeforeEvent >= 15 ? 70 : daysBeforeEvent >= 7 ? 50 : 0;
    return {
      daysBeforeEvent,
      refundPercent,
      refundAmount: { amount: Math.round((booking.total.amount * refundPercent) / 100), currency: booking.total.currency },
    };
  }
}
