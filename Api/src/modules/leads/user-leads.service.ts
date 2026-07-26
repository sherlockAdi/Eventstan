import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateUserLeadDto } from './dto/create-user-lead.dto';
import { UpdateUserLeadDto } from './dto/update-user-lead.dto';

@Injectable()
export class UserLeadsService {
  private readonly db: PrismaClient;

  constructor(private readonly prisma: PrismaService) {
    this.db = prisma as unknown as PrismaClient;
  }

  list(status?: string, search?: string) {
    return this.db.userLead.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { eventType: { contains: search, mode: 'insensitive' } },
                { additionalDetails: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const lead = await this.db.userLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('User lead not found');
    return lead;
  }

  create(dto: CreateUserLeadDto) {
    return this.db.userLead.create({
      data: {
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone.trim(),
        eventType: dto.eventType.trim(),
        preferredEventDate: new Date(dto.preferredEventDate),
        expectedGuestCount: dto.expectedGuestCount,
        budgetRange: dto.budgetRange as unknown as Prisma.InputJsonValue,
        servicesNeeded: dto.servicesNeeded.map((value) => value.trim()),
        additionalDetails: dto.additionalDetails?.trim() || null,
      },
    });
  }

  async update(id: string, dto: UpdateUserLeadDto) {
    await this.get(id);
    return this.db.userLead.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName.trim() } : {}),
        ...(dto.email !== undefined ? { email: dto.email.trim().toLowerCase() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone.trim() } : {}),
        ...(dto.eventType !== undefined ? { eventType: dto.eventType.trim() } : {}),
        ...(dto.preferredEventDate !== undefined
          ? { preferredEventDate: new Date(dto.preferredEventDate) }
          : {}),
        ...(dto.expectedGuestCount !== undefined ? { expectedGuestCount: dto.expectedGuestCount } : {}),
        ...(dto.budgetRange !== undefined
          ? { budgetRange: dto.budgetRange as unknown as Prisma.InputJsonValue }
          : {}),
        ...(dto.servicesNeeded !== undefined
          ? { servicesNeeded: dto.servicesNeeded.map((value) => value.trim()) }
          : {}),
        ...(dto.additionalDetails !== undefined
          ? { additionalDetails: dto.additionalDetails.trim() || null }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status.trim() } : {}),
      },
    });
  }

  async delete(id: string) {
    await this.get(id);
    return this.db.userLead.delete({ where: { id } });
  }
}
