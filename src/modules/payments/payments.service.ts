import { Injectable } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { DataStoreService } from '../../shared/data-store/data-store.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly store: DataStoreService,
    private readonly bookings: BookingsService,
  ) {}

  createIntent(dto: CreatePaymentDto) {
    const booking = this.bookings.findOne(dto.bookingId);
    const amount = dto.paymentType === 'FULL'
      ? booking.total
      : dto.paymentType === 'REMAINING'
        ? booking.remainingDue
        : booking.advanceDue;
    const payment = {
      id: this.store.nextId('pay'),
      bookingId: dto.bookingId,
      provider: 'STRIPE',
      paymentType: dto.paymentType,
      amount,
      status: 'REQUIRES_PAYMENT_METHOD',
      clientSecret: `pi_demo_${this.store.nextId('secret')}`,
      createdAt: new Date().toISOString(),
    };
    this.store.payments.push(payment);
    return payment;
  }

  markSucceeded(paymentId: string) {
    const payment = this.store.payments.find((item) => item.id === paymentId);
    if (!payment) return { paymentId, status: 'NOT_FOUND' };
    payment.status = 'SUCCEEDED';
    payment.succeededAt = new Date().toISOString();
    this.bookings.markPaymentReceived(payment.bookingId);
    return payment;
  }

  list() {
    return this.store.payments;
  }
}
