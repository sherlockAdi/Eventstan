import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateVendorLeadDto } from './dto/create-vendor-lead.dto';
import { UpdateVendorLeadDto } from './dto/update-vendor-lead.dto';

@Injectable()
export class VendorLeadsService {
  private readonly db: PrismaClient;

  constructor(private readonly prisma: PrismaService) {
    this.db = prisma as unknown as PrismaClient;
  }

  list(status?: string, search?: string) {
    return this.db.vendorLead.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { businessName: { contains: search, mode: 'insensitive' } },
                { yourName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { message: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const lead = await this.db.vendorLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Vendor lead not found');
    return lead;
  }

  create(dto: CreateVendorLeadDto) {
    return this.db.vendorLead.create({
      data: {
        businessName: dto.businessName.trim(),
        yourName: dto.yourName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone.trim(),
        websiteSocialMedia: (dto.websiteSocialMedia ?? []).map((value) => value.trim()),
        serviceCategoryId: dto.serviceCategoryId?.trim() || null,
        cityId: dto.cityId?.trim() || null,
        yearsOfExperience: dto.yearsOfExperience,
        message: dto.message?.trim() || null,
      },
    });
  }

  async update(id: string, dto: UpdateVendorLeadDto) {
    await this.get(id);
    return this.db.vendorLead.update({
      where: { id },
      data: {
        ...(dto.businessName !== undefined ? { businessName: dto.businessName.trim() } : {}),
        ...(dto.yourName !== undefined ? { yourName: dto.yourName.trim() } : {}),
        ...(dto.email !== undefined ? { email: dto.email.trim().toLowerCase() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone.trim() } : {}),
        ...(dto.websiteSocialMedia !== undefined
          ? { websiteSocialMedia: dto.websiteSocialMedia.map((value) => value.trim()) }
          : {}),
        ...(dto.serviceCategoryId !== undefined ? { serviceCategoryId: dto.serviceCategoryId.trim() || null } : {}),
        ...(dto.cityId !== undefined ? { cityId: dto.cityId.trim() || null } : {}),
        ...(dto.yearsOfExperience !== undefined ? { yearsOfExperience: dto.yearsOfExperience } : {}),
        ...(dto.message !== undefined ? { message: dto.message.trim() || null } : {}),
        ...(dto.status !== undefined ? { status: dto.status.trim() } : {}),
      },
    });
  }

  async delete(id: string) {
    await this.get(id);
    return this.db.vendorLead.delete({ where: { id } });
  }
}
