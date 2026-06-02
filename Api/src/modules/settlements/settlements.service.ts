import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { DataStoreService } from '../../shared/data-store/data-store.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';

@Injectable()
export class SettlementsService {
  constructor(
    private readonly store: DataStoreService,
    private readonly bookings: BookingsService,
  ) {}

  create(dto: CreateSettlementDto) {
    const booking = this.bookings.findOne(dto.bookingId);
    if (booking.status !== 'COMPLETED') throw new BadRequestException('Settlement can be created only after completion');
    const vendorId = booking.items[0].vendorId;
    const vendor = this.store.vendors.find((item) => item.id === vendorId);
    if (!vendor) throw new BadRequestException('Vendor not found');
    const commissionAmount = Math.round((booking.total.amount * vendor.commissionPercent) / 100);
    const settlement = {
      id: this.store.nextId('set'),
      bookingId: dto.bookingId,
      vendorId,
      grossAmount: booking.total,
      commission: { amount: commissionAmount, currency: booking.total.currency },
      payable: { amount: booking.total.amount - commissionAmount, currency: booking.total.currency },
      status: 'PENDING_PAYOUT',
      createdAt: new Date().toISOString(),
    };
    this.store.settlements.push(settlement);
    return settlement;
  }

  markPaid(id: string) {
    const settlement = this.store.settlements.find((item) => item.id === id);
    if (!settlement) throw new BadRequestException('Settlement not found');
    settlement.status = 'PAID';
    settlement.paidAt = new Date().toISOString();
    return settlement;
  }

  list() {
    return this.store.settlements;
  }
}
