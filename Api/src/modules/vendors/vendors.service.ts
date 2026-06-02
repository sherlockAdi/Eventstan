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
        ...dto,
        commissionPercent: dto.commissionPercent,
        vatNumber: dto.vatNumber ?? null,
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
      data: {
        ...(dto.companyName ? { companyName: dto.companyName } : {}),
        ...(dto.contactPerson ? { contactPerson: dto.contactPerson } : {}),
        ...(dto.email ? { email: dto.email } : {}),
        ...(dto.phone ? { phone: dto.phone } : {}),
        ...(dto.tradeLicenseNumber ? { tradeLicenseNumber: dto.tradeLicenseNumber } : {}),
        ...(dto.vatNumber !== undefined ? { vatNumber: dto.vatNumber } : {}),
        ...(dto.cities ? { cities: dto.cities } : {}),
        ...(dto.capacityPerDay !== undefined ? { capacityPerDay: dto.capacityPerDay } : {}),
        ...(dto.commissionPercent !== undefined ? { commissionPercent: dto.commissionPercent } : {}),
      },
    });
  }

  updateStatus(id: string, status: VendorStatus, reason?: string) {
    return this.prisma.vendor.update({ where: { id }, data: { status } }).then((vendor) => ({ ...vendor, statusReason: reason }));
  }

  delete(id: string) {
    return this.prisma.vendor.delete({ where: { id } });
  }
}
