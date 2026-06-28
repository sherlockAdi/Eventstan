import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  private async ensureUniqueSlug(rawSlug: string, excludeId?: string) {
    const slug = this.slugify(rawSlug);
    if (!slug) throw new BadRequestException('Service slug is required');
    const existing = await this.prisma.vendorService.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (existing) throw new BadRequestException('Service slug is already in use');
    return slug;
  }

  private resolveMinPrice(dto: CreateServiceDto | (Partial<CreateServiceDto> & { status?: string })) {
    return dto.priceMin ?? dto.price?.amount ?? 0;
  }

  private resolveCurrency(dto: CreateServiceDto | (Partial<CreateServiceDto> & { status?: string })) {
    return dto.currency ?? dto.price?.currency ?? 'AED';
  }

  async create(dto: CreateServiceDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: dto.vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');
    const slug = await this.ensureUniqueSlug(dto.slug);
    const service = await this.prisma.vendorService.create({
      data: {
        vendorId: dto.vendorId,
        categoryId: dto.categoryId,
        slug,
        title: dto.title,
        description: dto.description,
        city: dto.city,
        minPrice: this.resolveMinPrice(dto),
        currency: this.resolveCurrency(dto),
        maxPrice: dto.priceMax ?? this.resolveMinPrice(dto),
        priceUnit: dto.priceUnit ?? 'per event',
        imageUrl: dto.imageUrl,
        tags: dto.tags ?? [],
        gallery: dto.gallery ?? [],
        features: dto.features ?? [],
        status: ListingStatus.DRAFT,
      },
      include: this.serviceInclude,
    });
    return this.toCustomerService(service);
  }

  async update(id: string, dto: Partial<CreateServiceDto> & { status?: string }) {
    const slug = dto.slug !== undefined ? await this.ensureUniqueSlug(dto.slug, id) : undefined;
    const service = await this.prisma.vendorService.update({
      where: { id },
      data: {
        ...(dto.vendorId ? { vendorId: dto.vendorId } : {}),
        ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.city ? { city: dto.city } : {}),
        ...((dto.priceMin !== undefined || dto.price) ? { minPrice: this.resolveMinPrice(dto), currency: this.resolveCurrency(dto) } : {}),
        ...(dto.priceMax !== undefined ? { maxPrice: dto.priceMax } : {}),
        ...(dto.priceUnit ? { priceUnit: dto.priceUnit } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.tags ? { tags: dto.tags } : {}),
        ...(dto.gallery ? { gallery: dto.gallery } : {}),
        ...(dto.features ? { features: dto.features } : {}),
        ...(dto.status ? { status: dto.status as ListingStatus } : {}),
      },
      include: this.serviceInclude,
    });
    return this.toCustomerService(service);
  }

  async delete(id: string) {
    return this.prisma.vendorService.delete({ where: { id } });
  }

  async search(categoryId?: string, city?: string, includeAll = false, vendorId?: string) {
    const services = await this.prisma.vendorService.findMany({
      where: {
        ...(includeAll ? {} : { status: ListingStatus.ACTIVE }),
        ...(vendorId ? { vendorId } : {}),
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
    const service = await this.prisma.vendorService.findFirst({
      where: {
        OR: [{ id }, { slug: { equals: id, mode: 'insensitive' } }],
      },
      include: this.serviceInclude,
    });
    if (!service) throw new NotFoundException('Service not found');
    return this.toCustomerService(service);
  }

  async checkSlugAvailability(rawSlug: string, excludeId?: string) {
    const slug = this.slugify(rawSlug);
    if (!slug) return { slug: '', available: false };
    const existing = await this.prisma.vendorService.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return { slug, available: !existing };
  }

  async vendorIdForUser(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor.id;
  }

  async assertCanManage(user: AuthenticatedUser, serviceId: string) {
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return;
    const service = await this.prisma.vendorService.findUnique({ where: { id: serviceId } });
    if (!service || service.vendorId !== (await this.vendorIdForUser(user.id))) {
      throw new NotFoundException('Service not found');
    }
  }

  private readonly serviceInclude = {
    vendor: true,
    category: true,
  };

  private toCustomerService(service: Awaited<ReturnType<typeof this.prisma.vendorService.findFirst>> & {
    vendor: { contactPerson: string; email: string; phone: string };
    category: { name: string };
  }) {
    return {
      id: service.id,
      vendorId: service.vendorId,
      categoryId: service.categoryId,
      slug: service.slug,
      title: service.title,
      category: service.category.name,
      description: service.description,
      city: service.city,
      location: service.city,
      price: { amount: service.minPrice, currency: service.currency },
      price_min: service.minPrice,
      price_max: service.maxPrice ?? service.minPrice,
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
    };
  }
}
