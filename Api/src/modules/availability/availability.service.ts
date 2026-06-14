import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async vendorIdForUser(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor.id;
  }

  async upsert(dto: UpsertAvailabilityDto & { vendorId: string }) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: dto.vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    const date = this.date(dto.date);

    return this.prisma.vendorAvailability.upsert({
      where: { vendorId_date: { vendorId: dto.vendorId, date } },
      update: {
        status: dto.status as AvailabilityStatus,
        capacity: dto.capacity,
        note: dto.note ?? null,
      },
      create: {
        vendorId: dto.vendorId,
        date,
        status: dto.status as AvailabilityStatus,
        capacity: dto.capacity,
        note: dto.note ?? null,
      },
    });
  }

  list(vendorId: string) {
    return this.prisma.vendorAvailability.findMany({
      where: { vendorId },
      orderBy: { date: 'asc' },
    });
  }

  async canBook(vendorId: string, date: string) {
    const availability = await this.prisma.vendorAvailability.findUnique({
      where: { vendorId_date: { vendorId, date: this.date(date) } },
    });
    return Boolean(
      availability &&
        availability.status === AvailabilityStatus.AVAILABLE &&
        availability.bookedCount < availability.capacity,
    );
  }

  async reserve(vendorId: string, date: string, tx: Prisma.TransactionClient = this.prisma) {
    const normalizedDate = this.date(date);
    const availability = await tx.vendorAvailability.findUnique({
      where: { vendorId_date: { vendorId, date: normalizedDate } },
    });
    if (
      !availability ||
      availability.status !== AvailabilityStatus.AVAILABLE ||
      availability.bookedCount >= availability.capacity
    ) {
      throw new BadRequestException('Vendor is not available for this date');
    }

    return tx.vendorAvailability.update({
      where: { id: availability.id },
      data: { bookedCount: { increment: 1 } },
    });
  }

  async release(vendorId: string, date: Date, tx: Prisma.TransactionClient = this.prisma) {
    const availability = await tx.vendorAvailability.findUnique({
      where: { vendorId_date: { vendorId, date: this.date(date) } },
    });
    if (!availability?.bookedCount) return;
    await tx.vendorAvailability.update({
      where: { id: availability.id },
      data: { bookedCount: { decrement: 1 } },
    });
  }

  private date(value: string | Date) {
    const date = value instanceof Date ? value : new Date(value);
    return new Date(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`);
  }
}
