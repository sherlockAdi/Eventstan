import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

type CategoryPayload = {
  name: string;
  slug?: string;
  parentId?: string | null;
  image?: string | null;
  showInHomePage?: boolean;
  isActive?: boolean;
};
type CountryPayload = {
  code: string;
  name: string;
  defaultCurrency: string;
  flag?: string;
  currencySymbol?: string;
  phoneCode?: string;
  status?: string;
};
type EventSlotPayload = { name: string; startTime: string; endTime: string; duration: string; status?: string };
type EmailTemplatePayload = { name: string; subject: string; trigger: string; body: string; status?: string };
type PriceUnitPayload = {
  code: string;
  label: string;
  minValue?: number | string | null;
  maxValue?: number | string | null;
  isActive?: boolean;
  sortOrder?: number;
  requireRange?: boolean;
  requiresHourRange?: boolean;
  requiresPersonRange?: boolean;
  requiresPieceRange?: boolean;
};
type VisaTypePayload = { name: string; status?: string };
type StatePayload = { countryId: number; name: string; code?: string; status?: string };
type CityPayload = { countryId: number; stateId: string; name: string; status?: string };
type DefaultStateSeed = { name: string; code?: string; status?: string };
type DefaultCitySeed = { name: string; stateName: string; status?: string };

@ApiTags('master-data')
@Controller('master-data')
export class MasterDataController {
  constructor(private readonly prisma: PrismaService) {}

  private get prismaClient() {
    return this.prisma as PrismaClient;
  }

  private readonly defaultPriceUnits: PriceUnitPayload[] = [
    { code: 'per event', label: 'Per Event', sortOrder: 1, isActive: true },
    { code: 'per day', label: 'Per Day', sortOrder: 2, isActive: true },
    { code: 'per hour', label: 'Per Hour', sortOrder: 3, isActive: true, requiresHourRange: true },
    { code: 'per person', label: 'Per Person', sortOrder: 4, isActive: true, requiresPersonRange: true },
    { code: 'per piece', label: 'Per Piece', sortOrder: 5, isActive: true, requiresPieceRange: true },
  ];

  private readonly defaultVisaTypes: VisaTypePayload[] = [
    { name: 'Freelancer', status: 'Active' },
    { name: 'Permanent', status: 'Active' },
    { name: 'Employment Visa', status: 'Active' },
    { name: 'UAE Work Visa', status: 'Active' },
    { name: 'Investor Visa', status: 'Active' },
    { name: 'Partner Visa', status: 'Active' },
  ];

  private readonly defaultStates: DefaultStateSeed[] = [
    { name: 'Dubai', code: 'DU', status: 'Active' },
    { name: 'Abu Dhabi', code: 'AZ', status: 'Active' },
    { name: 'Sharjah', code: 'SH', status: 'Active' },
    { name: 'Ajman', code: 'AJ', status: 'Active' },
    { name: 'Ras Al Khaimah', code: 'RK', status: 'Active' },
    { name: 'Fujairah', code: 'FU', status: 'Active' },
    { name: 'Umm Al Quwain', code: 'UQ', status: 'Active' },
  ];

  private readonly defaultCities: DefaultCitySeed[] = [
    { stateName: 'Dubai', name: 'Dubai', status: 'Active' },
    { stateName: 'Abu Dhabi', name: 'Abu Dhabi', status: 'Active' },
    { stateName: 'Sharjah', name: 'Sharjah', status: 'Active' },
    { stateName: 'Ajman', name: 'Ajman', status: 'Active' },
    { stateName: 'Ras Al Khaimah', name: 'Ras Al Khaimah', status: 'Active' },
    { stateName: 'Fujairah', name: 'Fujairah', status: 'Active' },
    { stateName: 'Umm Al Quwain', name: 'Umm Al Quwain', status: 'Active' },
    { stateName: 'Abu Dhabi', name: 'Al Ain', status: 'Active' },
  ];

  @Get('categories')
  listCategories() {
    return this.prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('categories')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  createCategory(@Body() body: CategoryPayload) {
    const data: Prisma.CategoryUncheckedCreateInput = {
      name: body.name,
      slug: body.slug || this.slugify(body.name),
      parentId: body.parentId ?? null,
      image: body.image ?? null,
      showInHomePage: body.showInHomePage ?? false,
      isActive: body.isActive ?? true,
    };
    return this.prisma.category.create({
      data,
    });
  }

  @Put('categories/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  updateCategory(@Param('id') id: string, @Body() body: Partial<CategoryPayload>) {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.slug !== undefined ? { slug: body.slug || (body.name ? this.slugify(body.name) : undefined) } : {}),
        ...(body.parentId !== undefined ? { parentId: body.parentId } : {}),
        ...(body.image !== undefined ? { image: body.image } : {}),
        ...(body.showInHomePage !== undefined ? { showInHomePage: body.showInHomePage } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      },
    });
  }

  @Delete('categories/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  deleteCategory(@Param('id') id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  @Get('countries')
  listCountries() {
    return this.prisma.country.findMany({
      orderBy: { id: 'asc' },
      include: { states: { orderBy: { name: 'asc' } } },
    });
  }

  @Post('countries')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  createCountry(@Body() body: CountryPayload) {
    return this.prisma.country.create({ data: body });
  }

  @Put('countries/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  updateCountry(@Param('id') id: string, @Body() body: Partial<CountryPayload>) {
    return this.prisma.country.update({ where: { id: Number(id) }, data: body });
  }

  @Delete('countries/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  deleteCountry(@Param('id') id: string) {
    return this.prisma.country.delete({ where: { id: Number(id) } });
  }

  @Get('states')
  async listStates(@Query('countryId') countryId?: string) {
    await this.ensureDefaultCountriesAndStates();
    return this.prismaClient.stateMaster.findMany({
      where: countryId ? { countryId: Number(countryId) } : undefined,
      orderBy: [{ countryId: 'asc' }, { name: 'asc' }],
      include: { country: true },
    });
  }

  @Post('states')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async createState(@Body() body: StatePayload) {
    const country = await this.prisma.country.findUnique({ where: { id: Number(body.countryId) } });
    if (!country) throw new BadRequestException('Country not found');
    const name = this.normalizeMasterName(body.name, 'State name is required');
    await this.ensureUniqueStateName(Number(body.countryId), name);
    return this.prismaClient.stateMaster.create({
      data: {
        countryId: Number(body.countryId),
        name,
        code: body.code?.trim() || null,
        status: body.status?.trim() || 'Active',
      },
    });
  }

  @Put('states/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async updateState(@Param('id') id: string, @Body() body: Partial<StatePayload>) {
    const existing = await this.prismaClient.stateMaster.findUnique({ where: { id } });
    if (!existing) throw new BadRequestException('State not found');
    const countryId = body.countryId !== undefined ? Number(body.countryId) : existing.countryId;
    if (body.countryId !== undefined) {
      const country = await this.prisma.country.findUnique({ where: { id: countryId } });
      if (!country) throw new BadRequestException('Country not found');
    }
    const name = body.name !== undefined ? this.normalizeMasterName(body.name, 'State name is required') : existing.name;
    await this.ensureUniqueStateName(countryId, name, id);
    return this.prismaClient.stateMaster.update({
      where: { id },
      data: {
        ...(body.countryId !== undefined ? { countryId } : {}),
        ...(body.name !== undefined ? { name } : {}),
        ...(body.code !== undefined ? { code: body.code.trim() || null } : {}),
        ...(body.status !== undefined ? { status: body.status.trim() || 'Active' } : {}),
      },
    });
  }

  @Delete('states/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  deleteState(@Param('id') id: string) {
    return this.prismaClient.stateMaster.delete({ where: { id } });
  }

  @Get('visa-types')
  async listVisaTypes() {
    await this.ensureDefaultVisaTypes();
    return this.prismaClient.visaTypeMaster.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('visa-types')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async createVisaType(@Body() body: VisaTypePayload) {
    const name = this.normalizeMasterName(body.name, 'Visa type name is required');
    await this.ensureUniqueVisaTypeName(name);
    return this.prismaClient.visaTypeMaster.create({
      data: {
        name,
        status: body.status?.trim() || 'Active',
      },
    });
  }

  @Put('visa-types/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async updateVisaType(@Param('id') id: string, @Body() body: Partial<VisaTypePayload>) {
    const existing = await this.prismaClient.visaTypeMaster.findUnique({ where: { id } });
    if (!existing) throw new BadRequestException('Visa type not found');
    const name = body.name !== undefined ? this.normalizeMasterName(body.name, 'Visa type name is required') : existing.name;
    await this.ensureUniqueVisaTypeName(name, id);
    return this.prismaClient.visaTypeMaster.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name } : {}),
        ...(body.status !== undefined ? { status: body.status.trim() || 'Active' } : {}),
      },
    });
  }

  @Delete('visa-types/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  deleteVisaType(@Param('id') id: string) {
    return this.prismaClient.visaTypeMaster.delete({ where: { id } });
  }

  @Get('cities')
  async listCities(@Query('countryId') countryId?: string, @Query('stateId') stateId?: string) {
    await this.ensureDefaultCountriesAndStates();
    await this.ensureDefaultCities();
    return this.prismaClient.cityMaster.findMany({
      where: {
        ...(countryId ? { countryId: Number(countryId) } : {}),
        ...(stateId ? { stateId } : {}),
      },
      orderBy: [{ countryId: 'asc' }, { stateId: 'asc' }, { name: 'asc' }],
      include: { country: true, state: true },
    });
  }

  @Post('cities')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async createCity(@Body() body: CityPayload) {
    const country = await this.prisma.country.findUnique({ where: { id: Number(body.countryId) } });
    if (!country) throw new BadRequestException('Country not found');
    const state = await this.prismaClient.stateMaster.findUnique({ where: { id: body.stateId } });
    if (!state || state.countryId !== Number(body.countryId)) {
      throw new BadRequestException('State not found for the selected country');
    }
    const name = this.normalizeMasterName(body.name, 'City name is required');
    await this.ensureUniqueCityName(Number(body.countryId), body.stateId, name);
    return this.prismaClient.cityMaster.create({
      data: {
        countryId: Number(body.countryId),
        stateId: body.stateId,
        name,
        status: body.status?.trim() || 'Active',
      },
    });
  }

  @Put('cities/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async updateCity(@Param('id') id: string, @Body() body: Partial<CityPayload>) {
    const existing = await this.prismaClient.cityMaster.findUnique({ where: { id } });
    if (!existing) throw new BadRequestException('City not found');
    const countryId = body.countryId !== undefined ? Number(body.countryId) : existing.countryId;
    const stateId = body.stateId !== undefined ? body.stateId : existing.stateId;
    if (body.countryId !== undefined) {
      const country = await this.prisma.country.findUnique({ where: { id: countryId } });
      if (!country) throw new BadRequestException('Country not found');
    }
    if (body.stateId !== undefined || body.countryId !== undefined) {
      const state = await this.prismaClient.stateMaster.findUnique({ where: { id: stateId } });
      if (!state || state.countryId !== countryId) {
        throw new BadRequestException('State not found for the selected country');
      }
    }
    const name = body.name !== undefined ? this.normalizeMasterName(body.name, 'City name is required') : existing.name;
    await this.ensureUniqueCityName(countryId, stateId, name, id);
    return this.prismaClient.cityMaster.update({
      where: { id },
      data: {
        ...(body.countryId !== undefined ? { countryId } : {}),
        ...(body.stateId !== undefined ? { stateId } : {}),
        ...(body.name !== undefined ? { name } : {}),
        ...(body.status !== undefined ? { status: body.status.trim() || 'Active' } : {}),
      },
    });
  }

  @Delete('cities/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  deleteCity(@Param('id') id: string) {
    return this.prismaClient.cityMaster.delete({ where: { id } });
  }

  @Get('currencies')
  listCurrencies() {
    return ['AED', 'USD', 'SAR', 'QAR', 'OMR', 'KWD', 'INR'];
  }

  @Get('price-units')
  async listPriceUnits() {
    await this.ensureDefaultPriceUnits();
    const units = await this.prisma.priceUnitMaster.findMany({
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });
    return units.map((unit) => this.formatPriceUnit(unit));
  }

  @Post('price-units')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async createPriceUnit(@Body() body: PriceUnitPayload) {
    const payload = this.normalizePriceUnitPayload(body);
    await this.ensurePriceUnitUnique(payload.code);
    const created = await this.prisma.priceUnitMaster.create({ data: payload });
    return this.formatPriceUnit(created);
  }

  @Put('price-units/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async updatePriceUnit(@Param('id') id: string, @Body() body: Partial<PriceUnitPayload>) {
    const existing = await this.prisma.priceUnitMaster.findUnique({ where: { id } });
    if (!existing) {
      throw new BadRequestException('Price unit not found');
    }
    const payload = this.normalizePriceUnitPayload({
      code: body.code ?? existing.code,
      label: body.label ?? existing.label,
      isActive: body.isActive ?? existing.isActive,
      sortOrder: body.sortOrder ?? existing.sortOrder,
      requireRange: body.requireRange ?? this.formatPriceUnit(existing).requireRange,
      requiresHourRange: body.requiresHourRange ?? existing.requiresHourRange,
      requiresPersonRange: body.requiresPersonRange ?? existing.requiresPersonRange,
      requiresPieceRange: body.requiresPieceRange ?? existing.requiresPieceRange,
    });
    await this.ensurePriceUnitUnique(payload.code, id);
    const updated = await this.prisma.priceUnitMaster.update({
      where: { id },
      data: payload,
    });
    return this.formatPriceUnit(updated);
  }

  @Delete('price-units/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async deletePriceUnit(@Param('id') id: string) {
    const priceUnit = await this.prisma.priceUnitMaster.findUnique({ where: { id } });
    if (!priceUnit) {
      throw new BadRequestException('Price unit not found');
    }

    const [servicesCount, packagesCount] = await Promise.all([
      this.prisma.vendorService.count(),
      this.prisma.eventPackage.count(),
    ]);

    if (servicesCount > 0 || packagesCount > 0) {
      const matchingServices = await this.prisma.vendorService.findMany({
        select: { id: true, priceUnit: true },
      });
      const matchingPackages = await this.prisma.eventPackage.findMany({
        select: { id: true, priceUnit: true },
      });
      const normalizedCode = this.normalizePriceUnitKey(priceUnit.code);
      const serviceInUse = matchingServices.some((service) => this.normalizePriceUnitKey(service.priceUnit) === normalizedCode);
      const packageInUse = matchingPackages.some((eventPackage) => this.normalizePriceUnitKey(eventPackage.priceUnit) === normalizedCode);

      if (serviceInUse || packageInUse) {
        throw new BadRequestException('This price unit is already used in services or packages');
      }
    }

    return this.prisma.priceUnitMaster.delete({ where: { id } });
  }

  @Get('event-slots')
  listEventSlots() {
    return this.prisma.eventSlot.findMany({ orderBy: { id: 'asc' } });
  }

  @Post('event-slots')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  createEventSlot(@Body() body: EventSlotPayload) {
    return this.prisma.eventSlot.create({ data: body });
  }

  @Put('event-slots/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  updateEventSlot(@Param('id') id: string, @Body() body: Partial<EventSlotPayload>) {
    return this.prisma.eventSlot.update({ where: { id: Number(id) }, data: body });
  }

  @Delete('event-slots/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  deleteEventSlot(@Param('id') id: string) {
    return this.prisma.eventSlot.delete({ where: { id: Number(id) } });
  }

  @Get('email-templates')
  listEmailTemplates() {
    return this.prisma.emailTemplate.findMany({ orderBy: { id: 'asc' } });
  }

  @Post('email-templates')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  createEmailTemplate(@Body() body: EmailTemplatePayload) {
    return this.prisma.emailTemplate.create({ data: body });
  }

  @Get('email-templates/:id')
  getEmailTemplate(@Param('id') id: string) {
    return this.prisma.emailTemplate.findUnique({ where: { id: Number(id) } });
  }

  @Put('email-templates/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  updateEmailTemplate(@Param('id') id: string, @Body() body: Partial<EmailTemplatePayload>) {
    return this.prisma.emailTemplate.update({ where: { id: Number(id) }, data: body });
  }

  @Delete('email-templates/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  deleteEmailTemplate(@Param('id') id: string) {
    return this.prisma.emailTemplate.delete({ where: { id: Number(id) } });
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private normalizePriceUnitKey(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private normalizeMasterName(value: string, errorMessage: string) {
    const name = value?.trim();
    if (!name) {
      throw new BadRequestException(errorMessage);
    }
    return name;
  }

  private formatPriceUnit(unit: {
    id: string;
    code: string;
    label: string;
    isActive: boolean;
    sortOrder: number;
    requiresHourRange: boolean;
    requiresPersonRange: boolean;
    requiresPieceRange: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: unit.id,
      code: unit.code,
      label: unit.label,
      isActive: unit.isActive,
      sortOrder: unit.sortOrder,
      requireRange: unit.requiresHourRange || unit.requiresPersonRange || unit.requiresPieceRange,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };
  }

  private normalizePriceUnitPayload(body: PriceUnitPayload) {
    const code = body.code.trim();
    const label = body.label.trim();
    if (!code || !label) {
      throw new BadRequestException('Code and label are required');
    }
    const minValue = this.normalizeNullableNumber(body.minValue);
    const maxValue = this.normalizeNullableNumber(body.maxValue);
    if (minValue !== null && maxValue !== null && minValue > maxValue) {
      throw new BadRequestException('Minimum value cannot be greater than maximum value');
    }

    const requireRange = body.requireRange;
    const requiresHourRange =
      requireRange !== undefined ? requireRange : body.requiresHourRange ?? false;
    const requiresPersonRange =
      requireRange !== undefined ? requireRange : body.requiresPersonRange ?? false;
    const requiresPieceRange =
      requireRange !== undefined ? requireRange : body.requiresPieceRange ?? false;

    return {
      code,
      label,
      minValue,
      maxValue,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
      requiresHourRange,
      requiresPersonRange,
      requiresPieceRange,
    };
  }

  private async ensurePriceUnitUnique(code: string, excludeId?: string) {
    const normalizedCode = this.normalizePriceUnitKey(code);
    const allUnits = await this.prisma.priceUnitMaster.findMany({
      select: { id: true, code: true },
    });
    const duplicate = allUnits.find(
      (unit) =>
        this.normalizePriceUnitKey(unit.code) === normalizedCode &&
        unit.id !== excludeId,
    );
    if (duplicate) {
      throw new BadRequestException('Price unit code already exists');
    }
  }

  private async ensureUniqueVisaTypeName(name: string, excludeId?: string) {
    const normalizedName = name.toLowerCase();
    const rows = await this.prismaClient.visaTypeMaster.findMany({
      select: { id: true, name: true },
    });
    const duplicate = rows.find(
      (row) => row.id !== excludeId && row.name.toLowerCase() === normalizedName,
    );
    if (duplicate) {
      throw new BadRequestException('Visa type already exists');
    }
  }

  private async ensureUniqueStateName(countryId: number, name: string, excludeId?: string) {
    const normalizedName = name.toLowerCase();
    const rows = await this.prismaClient.stateMaster.findMany({
      select: { id: true, name: true, countryId: true },
    });
    const duplicate = rows.find(
      (row) => row.id !== excludeId && row.countryId === countryId && row.name.toLowerCase() === normalizedName,
    );
    if (duplicate) {
      throw new BadRequestException('State already exists');
    }
  }

  private async ensureUniqueCityName(countryId: number, stateId: string, name: string, excludeId?: string) {
    const normalizedName = name.toLowerCase();
    const rows = await this.prismaClient.cityMaster.findMany({
      select: { id: true, name: true, countryId: true, stateId: true },
    });
    const duplicate = rows.find(
      (row) =>
        row.id !== excludeId &&
        row.countryId === countryId &&
        row.stateId === stateId &&
        row.name.toLowerCase() === normalizedName,
    );
    if (duplicate) {
      throw new BadRequestException('City already exists');
    }
  }

  private async ensureDefaultCountriesAndStates() {
    let ae = await this.prisma.country.findUnique({ where: { code: 'AE' } });
    if (!ae) {
      ae = await this.prisma.country.create({
        data: {
          code: 'AE',
          name: 'United Arab Emirates',
          defaultCurrency: 'AED',
          currencySymbol: 'AED',
          phoneCode: '+971',
          status: 'Active',
        },
      });
    }

    for (const state of this.defaultStates) {
      const existing = await this.prismaClient.stateMaster.findFirst({
        where: {
          countryId: ae.id,
          OR: [
            { name: { equals: state.name, mode: 'insensitive' } },
            ...(state.code ? [{ code: state.code }] : []),
          ],
        },
        select: { id: true },
      });
      if (!existing) {
        await this.prismaClient.stateMaster.create({
          data: {
            countryId: ae.id,
            name: state.name,
            code: state.code ?? null,
            status: state.status ?? 'Active',
          },
        });
      } else {
        await this.prismaClient.stateMaster.update({
          where: { id: existing.id },
          data: {
            name: state.name,
            ...(state.code ? { code: state.code } : {}),
            status: state.status ?? 'Active',
          },
        });
      }
    }
  }

  private async ensureDefaultPriceUnits() {
    const existing = await this.prisma.priceUnitMaster.findMany({
      select: { id: true, code: true },
    });

    for (const unit of this.defaultPriceUnits) {
      const match = existing.find(
        (current) =>
          this.normalizePriceUnitKey(current.code) === this.normalizePriceUnitKey(unit.code),
      );
      if (!match) {
        await this.prisma.priceUnitMaster.create({
          data: {
            code: unit.code,
            label: unit.label,
            minValue: this.normalizeNullableNumber(unit.minValue),
            maxValue: this.normalizeNullableNumber(unit.maxValue),
            isActive: unit.isActive ?? true,
            sortOrder: unit.sortOrder ?? 0,
            requiresHourRange: unit.requiresHourRange ?? false,
            requiresPersonRange: unit.requiresPersonRange ?? false,
            requiresPieceRange: unit.requiresPieceRange ?? false,
          },
        });
      } else {
        await this.prisma.priceUnitMaster.update({
          where: { id: match.id },
          data: {
            label: unit.label,
            isActive: true,
            sortOrder: unit.sortOrder ?? 0,
            requiresHourRange: unit.requiresHourRange ?? false,
            requiresPersonRange: unit.requiresPersonRange ?? false,
            requiresPieceRange: unit.requiresPieceRange ?? false,
          },
        });
      }
    }
  }

  private normalizeNullableNumber(value?: number | string | null) {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new BadRequestException('Min and max values must be numeric');
    }
    return parsed;
  }

  private async ensureDefaultVisaTypes() {
    const existing = await this.prismaClient.visaTypeMaster.findMany({
      select: { id: true, name: true },
    });

    for (const visaType of this.defaultVisaTypes) {
      const match = existing.find(
        (current) => current.name.trim().toLowerCase() === visaType.name.toLowerCase(),
      );
      if (!match) {
        await this.prismaClient.visaTypeMaster.create({
          data: {
            name: visaType.name,
            status: visaType.status ?? 'Active',
          },
        });
      }
    }
  }

  private async ensureDefaultCities() {
    await this.ensureDefaultCountriesAndStates();
    const ae = await this.prisma.country.findUnique({ where: { code: 'AE' } });
    if (!ae) return;

    const states = await this.prismaClient.stateMaster.findMany({ where: { countryId: ae.id } });
    const stateByName = new Map(states.map((state) => [state.name.trim().toLowerCase(), state]));
    const existing = await this.prismaClient.cityMaster.findMany({
      select: { id: true, name: true, countryId: true, stateId: true },
    });

    for (const city of this.defaultCities) {
      const state = stateByName.get(city.stateName.trim().toLowerCase());
      if (!state) continue;
      const match = existing.find(
        (current) =>
          current.countryId === ae.id &&
          current.stateId === state.id &&
          current.name.trim().toLowerCase() === city.name.toLowerCase(),
      );
      if (!match) {
        await this.prismaClient.cityMaster.create({
          data: {
            countryId: ae.id,
            stateId: state.id,
            name: city.name,
            status: city.status ?? 'Active',
          },
        });
      }
    }
  }
}
