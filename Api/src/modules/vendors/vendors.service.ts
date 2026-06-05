import { Injectable, NotFoundException } from '@nestjs/common';
import { VendorStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateVendorDto) {
    return this.prisma.vendor.create({
      data: {
        ...(this.vendorData(dto) as any),
        status: VendorStatus.PENDING_VERIFICATION,
      },
    });
  }

  findAll(status?: VendorStatus) {
    return this.prisma.vendor.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  update(id: string, dto: Partial<CreateVendorDto>) {
    return this.prisma.vendor.update({
      where: { id },
      data: this.vendorData(dto) as any,
    });
  }

  updateStatus(id: string, status: VendorStatus, reason?: string) {
    return this.prisma.vendor.update({ where: { id }, data: { status } }).then((vendor) => ({ ...vendor, statusReason: reason }));
  }

  delete(id: string) {
    return this.prisma.vendor.delete({ where: { id } });
  }

  private vendorData(dto: Partial<CreateVendorDto>) {
    const data: Record<string, unknown> = {};

    const stringFields: Array<keyof CreateVendorDto> = [
      'companyName',
      'contactPerson',
      'email',
      'phone',
      'about',
      'firstName',
      'lastName',
      'userName',
      'primaryEmail',
      'telephone',
      'primaryMobile',
      'specialization',
      'businessLocation',
      'visaType',
      'address',
      'tradeLicenseNumber',
      'vatNumber',
      'planDetails',
      'agreementFileUrl',
      'agreementFileKey',
      'bankName',
      'accountFullName',
      'ibanNo',
      'accountNumber',
      'swift',
      'branchAddress',
    ];

    for (const field of stringFields) {
      if (dto[field] !== undefined) data[field] = dto[field] || null;
    }

    if (dto.cities !== undefined) data.cities = dto.cities;
    if (dto.capacityPerDay !== undefined) data.capacityPerDay = dto.capacityPerDay;
    if (dto.commissionPercent !== undefined) data.commissionPercent = dto.commissionPercent;
    if (dto.planExpiry !== undefined) data.planExpiry = dto.planExpiry ? new Date(dto.planExpiry) : null;

    return data;
  }
}
