import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
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
    if (!services.length) throw new NotFoundException('Package requires at least one service');
    if (services.some((service) => service.vendorId !== dto.vendorId)) {
      throw new NotFoundException('All package services must belong to the selected vendor');
    }
    const vendorId = dto.vendorId;
    const eventPackage = await this.prisma.eventPackage.create({
      data: {
        vendorId,
        title: dto.title,
        description: dto.description,
        amount: dto.price.amount,
        currency: dto.price.currency,
        inclusions: [],
        features: [],
        status: ListingStatus.DRAFT,
        items: {
          create: dto.itemIds.map((serviceId) => ({ serviceId })),
        },
      },
      include: this.packageInclude,
    });
    return this.toCustomerPackage(eventPackage);
  }

  async findAll(includeAll = false, vendorId?: string) {
    const packages = await this.prisma.eventPackage.findMany({
      where: {
        ...(includeAll ? {} : { status: ListingStatus.ACTIVE }),
        ...(vendorId ? { vendorId } : {}),
      },
      include: this.packageInclude,
      orderBy: { createdAt: 'desc' },
    });
    return packages.map((item) => this.toCustomerPackage(item));
  }

  async findOne(id: string, user?: AuthenticatedUser) {
    const eventPackage = await this.prisma.eventPackage.findUnique({
      where: { id },
      include: this.packageInclude,
    });
    if (!eventPackage) throw new NotFoundException('Package not found');

    if (eventPackage.status !== ListingStatus.ACTIVE) {
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
      const isOwner =
        user?.role === 'VENDOR' &&
        eventPackage.vendorId === (await this.vendorIdForUser(user.id));
      if (!isAdmin && !isOwner) throw new NotFoundException('Package not found');
    }

    return this.toCustomerPackage(eventPackage);
  }

  async update(id: string, dto: Partial<CreatePackageDto> & { status?: string }) {
    const existingPackage = await this.prisma.eventPackage.findUnique({ where: { id } });
    if (!existingPackage) throw new NotFoundException('Package not found');
    if (dto.itemIds?.length) {
      const services = await this.prisma.vendorService.findMany({
        where: { id: { in: dto.itemIds } },
      });
      const missingService = dto.itemIds.find((serviceId) => !services.some((service) => service.id === serviceId));
      if (missingService) throw new NotFoundException(`Package item not found: ${missingService}`);
      if (services.some((service) => service.vendorId !== existingPackage.vendorId)) {
        throw new NotFoundException('All package services must belong to the package vendor');
      }
    }

    const updated = await this.prisma.eventPackage.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.price ? { amount: dto.price.amount, currency: dto.price.currency } : {}),
        ...(dto.status ? { status: dto.status as ListingStatus } : {}),
        ...(dto.itemIds
          ? {
              items: {
                deleteMany: {},
                create: dto.itemIds.map((serviceId) => ({ serviceId })),
              },
            }
          : {}),
      },
      include: this.packageInclude,
    });

    return this.toCustomerPackage(updated);
  }

  async delete(id: string) {
    await this.prisma.packageItem.deleteMany({ where: { packageId: id } });
    return this.prisma.eventPackage.delete({ where: { id } });
  }

  async vendorIdForUser(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor.id;
  }

  async assertCanManage(user: AuthenticatedUser, packageId: string) {
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return;
    const eventPackage = await this.prisma.eventPackage.findUnique({ where: { id: packageId } });
    if (!eventPackage || eventPackage.vendorId !== (await this.vendorIdForUser(user.id))) {
      throw new NotFoundException('Package not found');
    }
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
