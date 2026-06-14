import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, PaymentProvider, PaymentStatus, PaymentType } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createIntent(dto: CreatePaymentDto, user: AuthenticatedUser) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { payments: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (user.role === 'CUSTOMER' && booking.customerId !== user.id) {
      throw new NotFoundException('Booking not found');
    }
    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.REFUNDED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException('Payment cannot be created for this booking');
    }

    const paymentType = dto.paymentType as PaymentType;
    const amount =
      paymentType === PaymentType.FULL
        ? booking.totalAmount
        : paymentType === PaymentType.REMAINING
          ? booking.remainingDueAmount
          : booking.advanceDueAmount;
    const paidAmount = booking.payments
      .filter((payment) => payment.status === PaymentStatus.SUCCEEDED)
      .reduce((sum, payment) => sum + payment.amount, 0);
    const outstanding = Math.max(0, booking.totalAmount - paidAmount);
    const payableAmount = Math.min(amount, outstanding);
    if (payableAmount <= 0) throw new BadRequestException('Booking has no outstanding balance');

    const providerRef = `evt_${randomUUID()}`;
    return this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: PaymentProvider.STRIPE,
        providerRef,
        paymentType,
        amount: payableAmount,
        currency: booking.currency,
        status: PaymentStatus.REQUIRES_PAYMENT_METHOD,
        clientSecret: `${providerRef}_secret_${randomUUID()}`,
      },
    });
  }

  async markSucceeded(paymentId: string, providerRef?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: { include: { payments: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.SUCCEEDED) return payment;
    if (payment.status === PaymentStatus.REFUNDED) throw new BadRequestException('Payment was refunded');

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCEEDED,
          succeededAt: new Date(),
          providerRef: providerRef ?? payment.providerRef,
        },
      });
      const otherPaid = payment.booking.payments
        .filter((item) => item.id !== paymentId && item.status === PaymentStatus.SUCCEEDED)
        .reduce((sum, item) => sum + item.amount, 0);
      const totalPaid = otherPaid + payment.amount;
      const status =
        totalPaid >= payment.booking.totalAmount
          ? BookingStatus.PAYMENT_RECEIVED
          : BookingStatus.VENDOR_REVIEW;
      await tx.booking.update({ where: { id: payment.bookingId }, data: { status } });
      return updatedPayment;
    });
  }

  async markFailed(paymentId: string) {
    await this.findOne(paymentId);
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED },
    });
  }

  list(bookingId?: string) {
    return this.prisma.payment.findMany({
      where: bookingId ? { bookingId } : {},
      include: { booking: { select: { customerId: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
