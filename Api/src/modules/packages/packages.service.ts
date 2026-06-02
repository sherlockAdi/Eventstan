import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePackageDto) {
    const services = await this.prisma.vendorService.findMany({
      where: { id: { in: dto.itemIds } },
    });
    const missingService = dto.itemIds.find((id) => !services.some((service) => service.id === id));
    if (missingService) throw new NotFoundException(`Package item not found: ${missingService}`);
    const vendorId = services[0].vendorId;
    const eventPackage = await this.prisma.eventPackage.create({
      data: {
        vendorId,
        title: dto.title,
        description: dto.description,
        amount: dto.price.amount,
        currency: dto.price.currency,
        inclusions: [],
        features: [],
        items: {
          create: dto.itemIds.map((serviceId) => ({ serviceId })),
        },
      },
      include: this.packageInclude,
    });
    return this.toCustomerPackage(eventPackage);
  }

  async findAll() {
    const packages = await this.prisma.eventPackage.findMany({
      where: { status: ListingStatus.ACTIVE },
      include: this.packageInclude,
      orderBy: { createdAt: 'desc' },
    });
    return packages.map((item) => this.toCustomerPackage(item));
  }

  private readonly packageInclude = {
    items: {
      include: {
        service: {
          include: {
            category: true,
          },
        },
      },
    },
  };

  private toCustomerPackage(eventPackage: {
    id: string;
    vendorId: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    priceUnit: string;
    inclusions: string[];
    features: string[];
    maxGuests: number | null;
    durationHours: number | null;
    isPopular: boolean;
    status: ListingStatus;
    createdAt: Date;
    items: Array<{ serviceId: string }>;
  }) {
    const serviceId = eventPackage.items[0]?.serviceId ?? '';
    return {
      ...eventPackage,
      service_id: serviceId,
      title: eventPackage.title,
      name: eventPackage.title,
      itemIds: eventPackage.items.map((item) => item.serviceId),
      price: eventPackage.amount,
      money: { amount: eventPackage.amount, currency: eventPackage.currency },
      inclusions: eventPackage.inclusions,
      features: eventPackage.features.length ? eventPackage.features : eventPackage.inclusions,
      max_guests: eventPackage.maxGuests ?? 0,
      duration_hours: eventPackage.durationHours ?? 0,
      price_unit: eventPackage.priceUnit,
      is_popular: eventPackage.isPopular,
      created_at: eventPackage.createdAt.toISOString(),
    };
  }
}
