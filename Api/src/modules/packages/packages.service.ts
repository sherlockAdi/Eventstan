import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus, PromotionDiscountType } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreatePackageDto } from './dto/create-package.dto';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveServiceId(dto: Pick<CreatePackageDto, 'serviceId' | 'itemIds'>) {
    return dto.serviceId || dto.itemIds?.[0] || '';
  }

  private resolveExactPrice(dto: CreatePackageDto | (Partial<CreatePackageDto> & { status?: string })) {
    return dto.exactPrice ?? dto.price?.amount ?? 0;
  }

  private resolveCurrency(dto: CreatePackageDto | (Partial<CreatePackageDto> & { status?: string })) {
    return dto.currency ?? dto.price?.currency ?? 'AED';
  }

  private normalizePromotion(dto: Partial<CreatePackageDto>) {
    if (!dto.isPromotional) {
      return {
        isPromotional: false,
        promotionDiscountType: null,
        promotionDiscountValue: null,
      };
    }

    return {
      isPromotional: true,
      promotionDiscountType: dto.promotionDiscountType ?? PromotionDiscountType.PERCENTAGE,
      promotionDiscountValue: dto.promotionDiscountValue ?? 0,
    };
  }

  private promotionalPriceOf(eventPackage: {
    exactPrice: number;
    isPromotional: boolean;
    promotionDiscountType: PromotionDiscountType | null;
    promotionDiscountValue: number | null;
  }) {
    if (!eventPackage.isPromotional || !eventPackage.promotionDiscountType || !eventPackage.promotionDiscountValue) {
      return eventPackage.exactPrice;
    }

    if (eventPackage.promotionDiscountType === PromotionDiscountType.FLAT) {
      return Math.max(0, eventPackage.exactPrice - eventPackage.promotionDiscountValue);
    }

    const discountAmount = Math.round((eventPackage.exactPrice * eventPackage.promotionDiscountValue) / 100);
    return Math.max(0, eventPackage.exactPrice - discountAmount);
  }

  async create(dto: CreatePackageDto) {
    const serviceId = this.resolveServiceId(dto);
    if (!serviceId) throw new NotFoundException('Package requires one service');
    const service = await this.prisma.vendorService.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException(`Package service not found: ${serviceId}`);
    if (service.vendorId !== dto.vendorId) {
      throw new NotFoundException('Package service must belong to the selected vendor');
    }
    const vendorId = dto.vendorId;
    const eventPackage = await this.prisma.eventPackage.create({
      data: {
        vendorId,
        title: dto.title,
        description: dto.description,
        exactPrice: this.resolveExactPrice(dto),
        currency: this.resolveCurrency(dto),
        showOnHomepage: dto.showOnHomepage ?? false,
        ...this.normalizePromotion(dto),
        inclusions: [],
        features: [],
        status: ListingStatus.DRAFT,
        items: {
          create: [{ serviceId }],
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
    const selectedServiceId = this.resolveServiceId({
      serviceId: dto.serviceId ?? '',
      itemIds: dto.itemIds,
    });
    if (selectedServiceId) {
      const service = await this.prisma.vendorService.findUnique({ where: { id: selectedServiceId } });
      if (!service) throw new NotFoundException(`Package service not found: ${selectedServiceId}`);
      if (service.vendorId !== existingPackage.vendorId) {
        throw new NotFoundException('Package service must belong to the package vendor');
      }
    }

    const updated = await this.prisma.eventPackage.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...((dto.exactPrice !== undefined || dto.price) ? { exactPrice: this.resolveExactPrice(dto), currency: this.resolveCurrency(dto) } : {}),
        ...(dto.showOnHomepage !== undefined ? { showOnHomepage: dto.showOnHomepage } : {}),
        ...(
          dto.isPromotional !== undefined ||
          dto.promotionDiscountType !== undefined ||
          dto.promotionDiscountValue !== undefined
            ? this.normalizePromotion({
                isPromotional: dto.isPromotional ?? existingPackage.isPromotional,
                promotionDiscountType: dto.promotionDiscountType,
                promotionDiscountValue: dto.promotionDiscountValue,
              })
            : {}
        ),
        ...(dto.status ? { status: dto.status as ListingStatus } : {}),
        ...(selectedServiceId
          ? {
              items: {
                deleteMany: {},
                create: [{ serviceId: selectedServiceId }],
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
    exactPrice: number;
    currency: string;
    priceUnit: string;
    inclusions: string[];
    features: string[];
    maxGuests: number | null;
    durationHours: number | null;
    isPopular: boolean;
    showOnHomepage: boolean;
    isPromotional: boolean;
    promotionDiscountType: PromotionDiscountType | null;
    promotionDiscountValue: number | null;
    status: ListingStatus;
    createdAt: Date;
    items: Array<{ serviceId: string }>;
  }) {
    const serviceId = eventPackage.items[0]?.serviceId ?? '';
    const promotionalPrice = this.promotionalPriceOf(eventPackage);
    return {
      ...eventPackage,
      service_id: serviceId,
      title: eventPackage.title,
      name: eventPackage.title,
      itemIds: eventPackage.items.map((item) => item.serviceId),
      exact_price: eventPackage.exactPrice,
      price: promotionalPrice,
      original_price: eventPackage.exactPrice,
      money: { amount: promotionalPrice, currency: eventPackage.currency },
      inclusions: eventPackage.inclusions,
      features: eventPackage.features.length ? eventPackage.features : eventPackage.inclusions,
      max_guests: eventPackage.maxGuests ?? 0,
      duration_hours: eventPackage.durationHours ?? 0,
      price_unit: eventPackage.priceUnit,
      is_popular: eventPackage.isPopular,
      show_on_homepage: eventPackage.showOnHomepage,
      showOnHomepage: eventPackage.showOnHomepage,
      is_promotional: eventPackage.isPromotional,
      isPromotional: eventPackage.isPromotional,
      promotion_discount_type: eventPackage.promotionDiscountType,
      promotionDiscountType: eventPackage.promotionDiscountType,
      promotion_discount_value: eventPackage.promotionDiscountValue,
      promotionDiscountValue: eventPackage.promotionDiscountValue,
      promotional_price: promotionalPrice,
      promotionalPrice,
      created_at: eventPackage.createdAt.toISOString(),
    };
  }
}
