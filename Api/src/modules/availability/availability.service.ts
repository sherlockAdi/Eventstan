import { Injectable, NotFoundException } from '@nestjs/common';
import { DataStoreService } from '../../shared/data-store/data-store.service';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly store: DataStoreService) {}

  upsert(dto: UpsertAvailabilityDto) {
    const vendor = this.store.vendors.find((item) => item.id === dto.vendorId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const existing = this.store.availability.find((item) => item.vendorId === dto.vendorId && item.date === dto.date);
    if (existing) {
      Object.assign(existing, dto);
      return existing;
    }

    const availability = { id: this.store.nextId('avl'), ...dto, note: dto.note ?? '', bookedCount: 0 };
    this.store.availability.push(availability);
    return availability;
  }

  list(vendorId: string) {
    return this.store.availability.filter((item) => item.vendorId === vendorId);
  }

  canBook(vendorId: string, date: string) {
    const availability = this.store.availability.find((item) => item.vendorId === vendorId && item.date === date);
    if (!availability) return false;
    return availability.status === 'AVAILABLE' && availability.bookedCount < availability.capacity;
  }

  reserve(vendorId: string, date: string) {
    const availability = this.store.availability.find((item) => item.vendorId === vendorId && item.date === date);
    if (!availability || !this.canBook(vendorId, date)) {
      throw new NotFoundException('Vendor is not available for this date');
    }
    availability.bookedCount += 1;
    return availability;
  }
}
