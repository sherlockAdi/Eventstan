import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus, PriceUnitMaster, PromotionDiscountType } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreatePackageDto } from './dto/create-package.dto';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultPriceUnits = [
    { code: 'per event', label: 'Per Event', sortOrder: 1 },
    { code: 'per day', label: 'Per Day', sortOrder: 2 },
    { code: 'per hour', label: 'Per Hour', sortOrder: 3, requiresHourRange: true },
    { code: 'per person', label: 'Per Person', sortOrder: 4, requiresPersonRange: true },
    { code: 'per piece', label: 'Per Piece', sortOrder: 5, requiresPieceRange: true },
  ];

  private resolveServiceId(dto: Pick<CreatePackageDto, 'serviceId' | 'itemIds'>) {
    return dto.serviceId || dto.itemIds?.[0] || '';
  }

  private resolveExactPrice(dto: CreatePackageDto | (Partial<CreatePackageDto> & { status?: string })) {
    return dto.exactPrice ?? dto.price?.amount ?? 0;
  }

  private resolveCurrency(dto: CreatePackageDto | (Partial<CreatePackageDto> & { status?: string })) {
    return dto.currency ?? dto.price?.currency ?? 'AED';
  }

  private resolvePriceUnit(dto: CreatePackageDto | (Partial<CreatePackageDto> & { status?: string })) {
    return dto.priceUnit ?? 'per event';
  }

  private normalizeIncludedItems(dto: Partial<CreatePackageDto>) {
    return dto.includedItems ?? [];
  }

  private normalizeFeatures(dto: Partial<CreatePackageDto>) {
    return dto.features ?? dto.includedItems ?? [];
  }

  private normalizeUnitFields(
    dto: Partial<CreatePackageDto>,
    priceUnitMaster?: Pick<PriceUnitMaster, 'requiresHourRange' | 'requiresPersonRange' | 'requiresPieceRange'>,
  ) {
    const common = {
      maxGuests: dto.maxGuests ?? null,
      durationHours: dto.durationHours ?? null,
    };

    if (priceUnitMaster?.requiresHourRange) {
      return {
        ...common,
        minHours: dto.minHours ?? null,
        maxHours: dto.maxHours ?? null,
        minPersons: null,
        maxPersons: null,
        minPieces: null,
        maxPieces: null,
      };
    }

    if (priceUnitMaster?.requiresPersonRange) {
      return {
        ...common,
        minHours: null,
        maxHours: null,
        minPersons: dto.minPersons ?? null,
        maxPersons: dto.maxPersons ?? null,
        minPieces: null,
        maxPieces: null,
      };
    }

    if (priceUnitMaster?.requiresPieceRange) {
      return {
        ...common,
        minHours: null,
        maxHours: null,
        minPersons: null,
        maxPersons: null,
        minPieces: dto.minPieces ?? null,
        maxPieces: dto.maxPieces ?? null,
      };
    }

    return {
      ...common,
      minHours: null,
      maxHours: null,
      minPersons: null,
      maxPersons: null,
      minPieces: null,
      maxPieces: null,
    };
  }

  private normalizePriceUnitKey(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private async resolvePriceUnitMaster(priceUnit?: string) {
    const selectedPriceUnit = priceUnit?.trim() || 'per event';
    const normalizedSelected = this.normalizePriceUnitKey(selectedPriceUnit);
    await this.ensureDefaultPriceUnits();
    const allPriceUnits = await this.prisma.priceUnitMaster.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });
    const match = allPriceUnits.find(
      (item) =>
        this.normalizePriceUnitKey(item.code) === normalizedSelected ||
        this.normalizePriceUnitKey(item.label) === normalizedSelected,
    );
    if (!match) {
      throw new BadRequestException('Selected price unit is not available in master data');
    }
    return match;
  }

  private async ensureDefaultPriceUnits() {
    const existing = await this.prisma.priceUnitMaster.findMany({
      select: { code: true },
    });
    if (existing.length > 0) {
      return;
    }

    await this.prisma.priceUnitMaster.createMany({
      data: this.defaultPriceUnits.map((unit) => ({
        code: unit.code,
        label: unit.label,
        sortOrder: unit.sortOrder,
        requiresHourRange: unit.requiresHourRange ?? false,
        requiresPersonRange: unit.requiresPersonRange ?? false,
        requiresPieceRange: unit.requiresPieceRange ?? false,
      })),
    });
  }

  private validateUnitFields(dto: Partial<CreatePackageDto>, priceUnitMaster: Pick<PriceUnitMaster, 'requiresHourRange' | 'requiresPersonRange' | 'requiresPieceRange'>) {
    const ensurePositive = (value: number | undefined, label: string) => {
      if (value === undefined || value === null || value <= 0) {
        throw new BadRequestException(`${label} must be greater than 0`);
      }
    };

    const ensureRange = (min: number | undefined, max: number | undefined, minLabel: string, maxLabel: string) => {
      ensurePositive(min, minLabel);
      ensurePositive(max, maxLabel);
      if ((min ?? 0) > (max ?? 0)) {
        throw new BadRequestException(`${minLabel} cannot be greater than ${maxLabel}`);
      }
    };

    if (dto.maxGuests !== undefined && dto.maxGuests <= 0) {
      throw new BadRequestException('Max guests must be greater than 0');
    }
    if (dto.durationHours !== undefined && dto.durationHours <= 0) {
      throw new BadRequestException('Duration hours must be greater than 0');
    }

    if (priceUnitMaster.requiresHourRange) {
      ensureRange(dto.minHours, dto.maxHours, 'Minimum hours', 'Maximum hours');
    }

    if (priceUnitMaster.requiresPersonRange) {
      ensureRange(dto.minPersons, dto.maxPersons, 'Minimum persons', 'Maximum persons');
    }

    if (priceUnitMaster.requiresPieceRange) {
      ensureRange(dto.minPieces, dto.maxPieces, 'Minimum pieces', 'Maximum pieces');
    }
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
    const priceUnitMaster = await this.resolvePriceUnitMaster(this.resolvePriceUnit(dto));
    this.validateUnitFields(dto, priceUnitMaster);
    const serviceId = this.resolveServiceId(dto);
    if (serviceId) {
      const service = await this.prisma.vendorService.findUnique({ where: { id: serviceId } });
      if (!service) throw new NotFoundException(`Package service not found: ${serviceId}`);
      if (service.vendorId !== dto.vendorId) {
        throw new NotFoundException('Package service must belong to the selected vendor');
      }
    }
    const vendorId = dto.vendorId;
    const eventPackage = await this.prisma.eventPackage.create({
      data: {
        vendorId,
        title: dto.title,
        description: dto.description,
        exactPrice: this.resolveExactPrice(dto),
        currency: this.resolveCurrency(dto),
        priceUnit: priceUnitMaster.code,
        showOnHomepage: dto.showOnHomepage ?? false,
        ...this.normalizePromotion(dto),
        inclusions: this.normalizeIncludedItems(dto),
        features: this.normalizeFeatures(dto),
        ...this.normalizeUnitFields(dto, priceUnitMaster),
        status: ListingStatus.DRAFT,
        ...(serviceId
          ? {
              items: {
                create: [{ serviceId }],
              },
            }
          : {}),
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
    const priceUnitMaster = await this.resolvePriceUnitMaster(dto.priceUnit ?? existingPackage.priceUnit);
    this.validateUnitFields(dto, priceUnitMaster);
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
        ...((dto.exactPrice !== undefined || dto.price)
          ? {
              exactPrice: this.resolveExactPrice(dto),
              currency: this.resolveCurrency(dto),
            }
          : {}),
        ...(dto.priceUnit !== undefined ? { priceUnit: priceUnitMaster.code } : {}),
        ...(dto.includedItems !== undefined ? { inclusions: this.normalizeIncludedItems(dto) } : {}),
        ...(dto.features !== undefined || dto.includedItems !== undefined
          ? { features: this.normalizeFeatures(dto) }
          : {}),
        ...(
          dto.maxGuests !== undefined ||
          dto.durationHours !== undefined ||
          dto.minHours !== undefined ||
          dto.maxHours !== undefined ||
          dto.minPersons !== undefined ||
          dto.maxPersons !== undefined ||
          dto.minPieces !== undefined ||
          dto.maxPieces !== undefined ||
          dto.priceUnit !== undefined
            ? this.normalizeUnitFields(
                {
                  maxGuests: dto.maxGuests ?? existingPackage.maxGuests ?? undefined,
                  durationHours: dto.durationHours ?? existingPackage.durationHours ?? undefined,
                  minHours: dto.minHours ?? existingPackage.minHours ?? undefined,
                  maxHours: dto.maxHours ?? existingPackage.maxHours ?? undefined,
                  minPersons: dto.minPersons ?? existingPackage.minPersons ?? undefined,
                  maxPersons: dto.maxPersons ?? existingPackage.maxPersons ?? undefined,
                  minPieces: dto.minPieces ?? existingPackage.minPieces ?? undefined,
                  maxPieces: dto.maxPieces ?? existingPackage.maxPieces ?? undefined,
                },
                priceUnitMaster,
              )
            : {}
        ),
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
        ...(dto.serviceId !== undefined && !selectedServiceId
          ? {
              items: {
                deleteMany: {},
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
    minHours?: number | null;
    maxHours?: number | null;
    minPersons?: number | null;
    maxPersons?: number | null;
    minPieces?: number | null;
    maxPieces?: number | null;
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
      maxGuests: eventPackage.maxGuests,
      durationHours: eventPackage.durationHours,
      min_hours: eventPackage.minHours,
      max_hours: eventPackage.maxHours,
      minHours: eventPackage.minHours,
      maxHours: eventPackage.maxHours,
      min_persons: eventPackage.minPersons,
      max_persons: eventPackage.maxPersons,
      minPersons: eventPackage.minPersons,
      maxPersons: eventPackage.maxPersons,
      min_pieces: eventPackage.minPieces,
      max_pieces: eventPackage.maxPieces,
      minPieces: eventPackage.minPieces,
      maxPieces: eventPackage.maxPieces,
      price_unit: eventPackage.priceUnit,
      priceUnit: eventPackage.priceUnit,
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
