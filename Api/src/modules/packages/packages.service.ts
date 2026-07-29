import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus, PriceUnitMaster, Prisma, PromotionDiscountType } from '@prisma/client';
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
  ) {
    return {
      maxGuests: dto.maxGuests ?? null,
      durationHours: dto.durationHours ?? null,
      minDays: dto.minDays ?? null,
      maxDays: dto.maxDays ?? null,
      minHours: dto.minHours ?? null,
      maxHours: dto.maxHours ?? null,
      minPersons: dto.minPersons ?? null,
      maxPersons: dto.maxPersons ?? null,
      minPieces: dto.minPieces ?? null,
      maxPieces: dto.maxPieces ?? null,
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
        requiresPieceRange: false,
      })),
    });
  }

  private validateUnitFields(dto: Partial<CreatePackageDto>, priceUnitMaster: Pick<PriceUnitMaster, 'requiresHourRange' | 'requiresPersonRange'>) {
    const ensurePositiveIfProvided = (value: number | undefined, label: string) => {
      if (value !== undefined && value !== null && value <= 0) {
        throw new BadRequestException(`${label} must be greater than 0`);
      }
    };

    const ensureRangeIfProvided = (min: number | undefined, max: number | undefined, minLabel: string, maxLabel: string) => {
      ensurePositiveIfProvided(min, minLabel);
      ensurePositiveIfProvided(max, maxLabel);
      if (min !== undefined && max !== undefined && min > max) {
        throw new BadRequestException(`${minLabel} cannot be greater than ${maxLabel}`);
      }
    };

    if (dto.maxGuests !== undefined && dto.maxGuests <= 0) {
      throw new BadRequestException('Max guests must be greater than 0');
    }
    if (dto.durationHours !== undefined && dto.durationHours <= 0) {
      throw new BadRequestException('Duration hours must be greater than 0');
    }
    ensureRangeIfProvided(dto.minDays, dto.maxDays, 'Minimum days', 'Maximum days');
    ensureRangeIfProvided(dto.minHours, dto.maxHours, 'Minimum hours', 'Maximum hours');
    ensureRangeIfProvided(dto.minPersons, dto.maxPersons, 'Minimum persons', 'Maximum persons');
    ensurePositiveIfProvided(dto.minPieces, 'Minimum pieces');
    ensurePositiveIfProvided(dto.maxPieces, 'Maximum pieces');
    if (dto.minPieces !== undefined && dto.maxPieces !== undefined && dto.minPieces > dto.maxPieces) {
      throw new BadRequestException('Minimum pieces cannot be greater than maximum pieces');
    }

    if (dto.isPromotional) {
      if (!dto.promotionStartDate || !dto.promotionEndDate) {
        throw new BadRequestException('Promotion start date and end date are required');
      }
      if (new Date(dto.promotionStartDate) >= new Date(dto.promotionEndDate)) {
        throw new BadRequestException('Promotion end date must be later than promotion start date');
      }
    }

    if (dto.isRental) {
      if (!dto.rentalLocation?.trim()) {
        throw new BadRequestException('Rental location is required for rental packages');
      }
      if (dto.requiresDeposit && (!dto.depositAmount || dto.depositAmount <= 0)) {
        throw new BadRequestException('Deposit amount must be greater than 0 when deposit is required');
      }
    }
  }

  private normalizePromotionDates(dto: Partial<CreatePackageDto>) {
    return {
      promotionStartDate: dto.promotionStartDate ? new Date(dto.promotionStartDate) : null,
      promotionEndDate: dto.promotionEndDate ? new Date(dto.promotionEndDate) : null,
    };
  }

  private asIsoString(value?: string | Date | null) {
    if (!value) return undefined;
    return value instanceof Date ? value.toISOString() : value;
  }

  private normalizeRentalFields(dto: Partial<CreatePackageDto>) {
    if (!dto.isRental) {
      return {
        isRental: false,
        rentalLocation: null,
        rentalLocationId: null,
        serviceArea: null,
        deliveryRadius: null,
        deliveryFeeType: null,
        deliveryFee: null,
        pickupAvailable: null,
        deliveryAvailable: null,
        requiresDeposit: null,
        depositAmount: null,
      };
    }

    return {
      isRental: true,
      rentalLocation: dto.rentalLocation?.trim() || null,
      rentalLocationId: dto.rentalLocationId?.trim() || null,
      serviceArea: dto.serviceArea?.trim() || null,
      deliveryRadius: dto.deliveryRadius ?? null,
      deliveryFeeType: dto.deliveryFeeType?.trim() || null,
      deliveryFee: dto.deliveryFee ?? null,
      pickupAvailable: dto.pickupAvailable ?? true,
      deliveryAvailable: dto.deliveryAvailable ?? true,
      requiresDeposit: dto.requiresDeposit ?? false,
      depositAmount: dto.requiresDeposit ? dto.depositAmount ?? null : null,
    };
  }

  private normalizeRentalFieldsForUpdate(
    dto: Partial<CreatePackageDto>,
    existingPackage: {
      isRental?: boolean | null;
      rentalLocation?: string | null;
      rentalLocationId?: string | null;
      serviceArea?: string | null;
      deliveryRadius?: number | null;
      deliveryFeeType?: string | null;
      deliveryFee?: number | null;
      pickupAvailable?: boolean | null;
      deliveryAvailable?: boolean | null;
      requiresDeposit?: boolean | null;
      depositAmount?: number | null;
    },
  ) {
    const isRental = dto.isRental ?? existingPackage.isRental;
    if (!isRental) {
      return {
        isRental: false,
        rentalLocation: null,
        rentalLocationId: null,
        serviceArea: null,
        deliveryRadius: null,
        deliveryFeeType: null,
        deliveryFee: null,
        pickupAvailable: null,
        deliveryAvailable: null,
        requiresDeposit: null,
        depositAmount: null,
      };
    }

    const requiresDeposit = dto.requiresDeposit ?? existingPackage.requiresDeposit ?? false;
    return {
      isRental: true,
      rentalLocation: dto.rentalLocation !== undefined ? dto.rentalLocation?.trim() || null : existingPackage.rentalLocation,
      rentalLocationId: dto.rentalLocationId !== undefined ? dto.rentalLocationId?.trim() || null : existingPackage.rentalLocationId,
      serviceArea: dto.serviceArea !== undefined ? dto.serviceArea?.trim() || null : existingPackage.serviceArea,
      deliveryRadius: dto.deliveryRadius !== undefined ? dto.deliveryRadius : existingPackage.deliveryRadius,
      deliveryFeeType: dto.deliveryFeeType !== undefined ? dto.deliveryFeeType?.trim() || null : existingPackage.deliveryFeeType,
      deliveryFee: dto.deliveryFee !== undefined ? dto.deliveryFee : existingPackage.deliveryFee,
      pickupAvailable: dto.pickupAvailable !== undefined ? dto.pickupAvailable : existingPackage.pickupAvailable,
      deliveryAvailable: dto.deliveryAvailable !== undefined ? dto.deliveryAvailable : existingPackage.deliveryAvailable,
      requiresDeposit,
      depositAmount: requiresDeposit
        ? (dto.depositAmount !== undefined ? dto.depositAmount : existingPackage.depositAmount)
        : null,
    };
  }

  private async resolveCategoryId(dto: Pick<CreatePackageDto, 'categoryId' | 'serviceId' | 'itemIds'>, vendorId: string) {
    const serviceId = this.resolveServiceId(dto);
    if (serviceId) {
      const service = await this.prisma.vendorService.findUnique({ where: { id: serviceId } });
      if (!service) {
        throw new NotFoundException(`Package service not found: ${serviceId}`);
      }
      if (service.vendorId !== vendorId) {
        throw new NotFoundException('Package service must belong to the selected vendor');
      }
      return { categoryId: service.categoryId, service };
    }

    if (!dto.categoryId) {
      throw new BadRequestException('Category is required when package is not linked to a service');
    }

    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return { categoryId: category.id, service: null };
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
    const vendorId = dto.vendorId;
    const { categoryId, service } = await this.resolveCategoryId(dto, vendorId);
    const serviceId = service?.id ?? this.resolveServiceId(dto);
    const createData: Prisma.EventPackageUncheckedCreateInput = {
        vendorId,
        categoryId,
        title: dto.title,
        description: dto.description,
        exactPrice: this.resolveExactPrice(dto),
        currency: this.resolveCurrency(dto),
        priceUnit: priceUnitMaster.code,
        showOnPromotionalPage: dto.showOnPromotionalPage ?? false,
        ...this.normalizePromotion(dto),
        ...this.normalizePromotionDates(dto),
        inclusions: this.normalizeIncludedItems(dto),
        features: this.normalizeFeatures(dto),
        imageUrl: dto.imageUrl ?? null,
        vendorPhone: dto.vendorPhone ?? null,
        ...this.normalizeUnitFields(dto),
        ...this.normalizeRentalFields(dto),
        status: ListingStatus.ACTIVE,
        ...(serviceId
          ? {
              items: {
                create: [{ serviceId }],
              },
            }
          : {}),
      } as Prisma.EventPackageUncheckedCreateInput;
    const eventPackage = await this.prisma.eventPackage.create({
      data: createData,
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
    const existingPackage = (await this.prisma.eventPackage.findUnique({ where: { id } })) as (Prisma.EventPackageUncheckedCreateInput & {
      id: string;
      createdAt?: Date;
      updatedAt?: Date;
    }) | null;
    if (!existingPackage) throw new NotFoundException('Package not found');
    const priceUnitMaster = await this.resolvePriceUnitMaster(dto.priceUnit ?? existingPackage.priceUnit);
    this.validateUnitFields(
      {
        ...dto,
        isPromotional: dto.isPromotional ?? existingPackage.isPromotional,
        promotionStartDate: dto.promotionStartDate ?? this.asIsoString(existingPackage.promotionStartDate),
        promotionEndDate: dto.promotionEndDate ?? this.asIsoString(existingPackage.promotionEndDate),
        isRental: dto.isRental ?? existingPackage.isRental,
        rentalLocation: dto.rentalLocation ?? existingPackage.rentalLocation ?? undefined,
        requiresDeposit: dto.requiresDeposit ?? existingPackage.requiresDeposit ?? undefined,
        depositAmount: dto.depositAmount ?? existingPackage.depositAmount ?? undefined,
        minDays: dto.minDays ?? existingPackage.minDays ?? undefined,
        maxDays: dto.maxDays ?? existingPackage.maxDays ?? undefined,
        minHours: dto.minHours ?? existingPackage.minHours ?? undefined,
        maxHours: dto.maxHours ?? existingPackage.maxHours ?? undefined,
        minPersons: dto.minPersons ?? existingPackage.minPersons ?? undefined,
        maxPersons: dto.maxPersons ?? existingPackage.maxPersons ?? undefined,
        minPieces: dto.minPieces ?? existingPackage.minPieces ?? undefined,
        maxPieces: dto.maxPieces ?? existingPackage.maxPieces ?? undefined,
      },
      priceUnitMaster,
    );
    const selectedServiceId = this.resolveServiceId({
      serviceId: dto.serviceId ?? '',
      itemIds: dto.itemIds,
    });
    const categoryResolution =
      dto.categoryId !== undefined || dto.serviceId !== undefined || dto.itemIds !== undefined
        ? await this.resolveCategoryId(
            {
              categoryId: dto.categoryId ?? existingPackage.categoryId ?? undefined,
              serviceId: dto.serviceId ?? '',
              itemIds: dto.itemIds,
            },
            existingPackage.vendorId,
          )
        : null;

    const updateData: Prisma.EventPackageUncheckedUpdateInput = {
        ...(categoryResolution ? { categoryId: categoryResolution.categoryId } : {}),
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
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl || null } : {}),
        ...(dto.vendorPhone !== undefined ? { vendorPhone: dto.vendorPhone || null } : {}),
        ...(
          dto.maxGuests !== undefined ||
          dto.durationHours !== undefined ||
          dto.minDays !== undefined ||
          dto.maxDays !== undefined ||
          dto.minHours !== undefined ||
          dto.maxHours !== undefined ||
          dto.minPersons !== undefined ||
          dto.maxPersons !== undefined ||
          dto.priceUnit !== undefined
            ? this.normalizeUnitFields(
                {
                  maxGuests: dto.maxGuests ?? existingPackage.maxGuests ?? undefined,
                  durationHours: dto.durationHours ?? existingPackage.durationHours ?? undefined,
                  minDays: dto.minDays ?? existingPackage.minDays ?? undefined,
                  maxDays: dto.maxDays ?? existingPackage.maxDays ?? undefined,
                  minHours: dto.minHours ?? existingPackage.minHours ?? undefined,
                  maxHours: dto.maxHours ?? existingPackage.maxHours ?? undefined,
                  minPersons: dto.minPersons ?? existingPackage.minPersons ?? undefined,
                  maxPersons: dto.maxPersons ?? existingPackage.maxPersons ?? undefined,
                  minPieces: dto.minPieces ?? existingPackage.minPieces ?? undefined,
                  maxPieces: dto.maxPieces ?? existingPackage.maxPieces ?? undefined,
                },
              )
            : {}
        ),
        ...(dto.showOnPromotionalPage !== undefined ? { showOnPromotionalPage: dto.showOnPromotionalPage } : {}),
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
        ...(
          dto.promotionStartDate !== undefined ||
          dto.promotionEndDate !== undefined ||
          dto.isPromotional !== undefined
            ? this.normalizePromotionDates({
                promotionStartDate: dto.isPromotional === false ? undefined : dto.promotionStartDate ?? this.asIsoString(existingPackage.promotionStartDate),
                promotionEndDate: dto.isPromotional === false ? undefined : dto.promotionEndDate ?? this.asIsoString(existingPackage.promotionEndDate),
              })
            : {}
        ),
        ...(
          dto.isRental !== undefined ||
          dto.rentalLocation !== undefined ||
          dto.rentalLocationId !== undefined ||
          dto.serviceArea !== undefined ||
          dto.deliveryRadius !== undefined ||
          dto.deliveryFeeType !== undefined ||
          dto.deliveryFee !== undefined ||
          dto.pickupAvailable !== undefined ||
          dto.deliveryAvailable !== undefined ||
          dto.requiresDeposit !== undefined ||
          dto.depositAmount !== undefined
            ? this.normalizeRentalFieldsForUpdate(dto, existingPackage)
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
      } as Prisma.EventPackageUncheckedUpdateInput;
    const updated = await this.prisma.eventPackage.update({
      where: { id },
      data: updateData,
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
    category: true,
  };

  private toCustomerPackage(eventPackage: any) {
    const serviceId = eventPackage.items[0]?.serviceId ?? '';
    const promotionalPrice = this.promotionalPriceOf(eventPackage);
    return {
      ...eventPackage,
      service_id: serviceId,
      category_id: eventPackage.categoryId,
      categoryId: eventPackage.categoryId,
      category_name: eventPackage.category?.name ?? '',
      category_slug: eventPackage.category?.slug ?? '',
      title: eventPackage.title,
      name: eventPackage.title,
      itemIds: eventPackage.items.map((item: { serviceId: string }) => item.serviceId),
      exact_price: eventPackage.exactPrice,
      price: promotionalPrice,
      original_price: eventPackage.exactPrice,
      money: { amount: promotionalPrice, currency: eventPackage.currency },
      inclusions: eventPackage.inclusions,
      features: eventPackage.features.length ? eventPackage.features : eventPackage.inclusions,
      image_url: eventPackage.imageUrl ?? '',
      imageUrl: eventPackage.imageUrl,
      vendor_phone: eventPackage.vendorPhone ?? '',
      vendorPhone: eventPackage.vendorPhone,
      max_guests: eventPackage.maxGuests ?? 0,
      duration_hours: eventPackage.durationHours ?? 0,
      maxGuests: eventPackage.maxGuests,
      durationHours: eventPackage.durationHours,
      min_days: eventPackage.minDays,
      max_days: eventPackage.maxDays,
      minDays: eventPackage.minDays,
      maxDays: eventPackage.maxDays,
      min_hours: eventPackage.minHours,
      max_hours: eventPackage.maxHours,
      minHours: eventPackage.minHours,
      maxHours: eventPackage.maxHours,
      min_persons: eventPackage.minPersons,
      max_persons: eventPackage.maxPersons,
      minPersons: eventPackage.minPersons,
      maxPersons: eventPackage.maxPersons,
      price_unit: eventPackage.priceUnit,
      priceUnit: eventPackage.priceUnit,
      is_popular: eventPackage.isPopular,
      show_on_promotional_page: eventPackage.showOnPromotionalPage,
      showOnPromotionalPage: eventPackage.showOnPromotionalPage,
      is_promotional: eventPackage.isPromotional,
      isPromotional: eventPackage.isPromotional,
      promotion_discount_type: eventPackage.promotionDiscountType,
      promotionDiscountType: eventPackage.promotionDiscountType,
      promotion_discount_value: eventPackage.promotionDiscountValue,
      promotionDiscountValue: eventPackage.promotionDiscountValue,
      promotion_start_date: eventPackage.promotionStartDate?.toISOString() ?? null,
      promotionStartDate: eventPackage.promotionStartDate?.toISOString() ?? null,
      promotion_end_date: eventPackage.promotionEndDate?.toISOString() ?? null,
      promotionEndDate: eventPackage.promotionEndDate?.toISOString() ?? null,
      promotional_price: promotionalPrice,
      promotionalPrice,
      is_rental: eventPackage.isRental,
      isRental: eventPackage.isRental,
      rental_location: eventPackage.rentalLocation ?? '',
      rentalLocation: eventPackage.rentalLocation,
      rental_location_id: eventPackage.rentalLocationId ?? '',
      rentalLocationId: eventPackage.rentalLocationId,
      service_area: eventPackage.serviceArea ?? '',
      serviceArea: eventPackage.serviceArea,
      delivery_radius: eventPackage.deliveryRadius,
      deliveryRadius: eventPackage.deliveryRadius,
      delivery_fee_type: eventPackage.deliveryFeeType,
      deliveryFeeType: eventPackage.deliveryFeeType,
      delivery_fee: eventPackage.deliveryFee,
      deliveryFee: eventPackage.deliveryFee,
      pickup_available: eventPackage.pickupAvailable,
      pickupAvailable: eventPackage.pickupAvailable,
      delivery_available: eventPackage.deliveryAvailable,
      deliveryAvailable: eventPackage.deliveryAvailable,
      requires_deposit: eventPackage.requiresDeposit,
      requiresDeposit: eventPackage.requiresDeposit,
      deposit_amount: eventPackage.depositAmount,
      depositAmount: eventPackage.depositAmount,
      created_at: eventPackage.createdAt.toISOString(),
    };
  }
}
