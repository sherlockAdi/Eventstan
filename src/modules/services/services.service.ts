import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateSubServiceDto } from './dto/create-sub-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServiceDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: dto.vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');
    const service = await this.prisma.vendorService.create({
      data: {
        vendorId: dto.vendorId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        city: dto.city,
        amount: dto.price.amount,
        currency: dto.price.currency,
        maxAmount: dto.priceMax ?? dto.price.amount,
        priceUnit: dto.priceUnit ?? 'per event',
        imageUrl: dto.imageUrl,
        tags: dto.tags ?? [],
        gallery: dto.gallery ?? [],
        features: dto.features ?? [],
      },
      include: this.serviceInclude,
    });
    return this.toCustomerService(service);
  }

  async createSubService(serviceId: string, dto: CreateSubServiceDto) {
    await this.findOne(serviceId);
    return this.prisma.vendorSubService.create({
      data: {
        serviceId,
        title: dto.title,
        description: dto.description,
        amount: dto.price.amount,
        currency: dto.price.currency,
      },
    });
  }

  async search(categoryId?: string, city?: string) {
    const services = await this.prisma.vendorService.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
        ...(categoryId
          ? {
              OR: [
                { categoryId },
                { category: { name: { equals: categoryId, mode: 'insensitive' } } },
                { category: { slug: { equals: categoryId, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: this.serviceInclude,
      orderBy: { createdAt: 'desc' },
    });
    return services.map((service) => this.toCustomerService(service));
  }

  async findOne(id: string) {
    const service = await this.prisma.vendorService.findUnique({
      where: { id },
      include: this.serviceInclude,
    });
    if (!service) throw new NotFoundException('Service not found');
    return this.toCustomerService(service);
  }

  async findSubServices(serviceId: string) {
    await this.findOne(serviceId);
    return this.prisma.vendorSubService.findMany({
      where: { serviceId, status: ListingStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
  }

  private readonly serviceInclude = {
    vendor: true,
    category: true,
    subServices: {
      where: { status: ListingStatus.ACTIVE },
      orderBy: { createdAt: 'desc' as const },
    },
  };

  private toCustomerService(service: Awaited<ReturnType<typeof this.prisma.vendorService.findFirst>> & {
    vendor: { contactPerson: string; email: string; phone: string };
    category: { name: string };
    subServices: unknown[];
  }) {
    return {
      id: service.id,
      vendorId: service.vendorId,
      categoryId: service.categoryId,
      title: service.title,
      category: service.category.name,
      description: service.description,
      city: service.city,
      location: service.city,
      price: { amount: service.amount, currency: service.currency },
      price_min: service.amount,
      price_max: service.maxAmount ?? service.amount,
      price_unit: service.priceUnit,
      rating: 0,
      review_count: 0,
      image_url: service.imageUrl ?? '',
      vendor_name: service.vendor.contactPerson,
      vendor_email: service.vendor.email,
      vendor_phone: service.vendor.phone,
      tags: service.tags,
      gallery: service.gallery,
      features: service.features,
      created_at: service.createdAt.toISOString(),
      status: service.status,
      subServices: service.subServices,
    };
  }
}
