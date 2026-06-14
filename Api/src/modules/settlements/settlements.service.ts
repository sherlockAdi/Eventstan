import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, SettlementStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';

@Injectable()
export class SettlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSettlementDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { items: true, settlements: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Settlement can be created only after completion');
    }
    if (booking.settlements.length) throw new BadRequestException('Settlement already exists');

    const totals = new Map<string, number>();
    for (const item of booking.items) {
      totals.set(item.vendorId, (totals.get(item.vendorId) ?? 0) + item.unitAmount * item.quantity);
    }

    return this.prisma.$transaction(async (tx) => {
      const settlements = [];
      for (const [vendorId, grossAmount] of totals.entries()) {
        const vendor = await tx.vendor.findUnique({ where: { id: vendorId } });
          if (!vendor) throw new NotFoundException(`Vendor not found: ${vendorId}`);
          const commissionAmount = Math.round((grossAmount * Number(vendor.commissionPercent)) / 100);
        settlements.push(
          await tx.settlement.create({
            data: {
              bookingId: booking.id,
              vendorId,
              grossAmount,
              commissionAmount,
              payableAmount: grossAmount - commissionAmount,
              currency: booking.currency,
              status: SettlementStatus.PENDING_PAYOUT,
            },
          }),
        );
      }
      return settlements;
    });
  }

  async markPaid(id: string) {
    await this.findOne(id);
    return this.prisma.settlement.update({
      where: { id },
      data: { status: SettlementStatus.PAID, paidAt: new Date() },
    });
  }

  list(vendorId?: string, status?: SettlementStatus) {
    return this.prisma.settlement.findMany({
      where: {
        ...(vendorId ? { vendorId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        vendor: { select: { companyName: true, email: true } },
        booking: { select: { status: true, completedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const settlement = await this.prisma.settlement.findUnique({ where: { id } });
    if (!settlement) throw new NotFoundException('Settlement not found');
    return settlement;
  }
}
