import { Injectable, NotFoundException } from '@nestjs/common';
import { DataStoreService, VendorStatus } from '../../shared/data-store/data-store.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly store: DataStoreService) {}

  create(dto: CreateVendorDto) {
    const vendor = {
      id: this.store.nextId('ven'),
      ...dto,
      vatNumber: dto.vatNumber ?? '',
      status: 'PENDING_VERIFICATION' as VendorStatus,
    };
    this.store.vendors.push(vendor);
    return vendor;
  }

  findAll(status?: VendorStatus) {
    return status ? this.store.vendors.filter((vendor) => vendor.status === status) : this.store.vendors;
  }

  findOne(id: string) {
    const vendor = this.store.vendors.find((item) => item.id === id);
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  updateStatus(id: string, status: VendorStatus, reason?: string) {
    const vendor = this.findOne(id);
    vendor.status = status;
    return { ...vendor, statusReason: reason };
  }
}
