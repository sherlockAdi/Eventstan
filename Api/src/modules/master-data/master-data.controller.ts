import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

type CategoryPayload = { name: string; slug?: string };
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
  isActive?: boolean;
  sortOrder?: number;
  requiresHourRange?: boolean;
  requiresPersonRange?: boolean;
  requiresPieceRange?: boolean;
};

@ApiTags('master-data')
@Controller('master-data')
export class MasterDataController {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultPriceUnits: PriceUnitPayload[] = [
    { code: 'per event', label: 'Per Event', sortOrder: 1 },
    { code: 'per day', label: 'Per Day', sortOrder: 2 },
    { code: 'per hour', label: 'Per Hour', sortOrder: 3, requiresHourRange: true },
    { code: 'per person', label: 'Per Person', sortOrder: 4, requiresPersonRange: true },
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
    return this.prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug || this.slugify(body.name),
      },
    });
  }

  @Put('categories/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  updateCategory(@Param('id') id: string, @Body() body: CategoryPayload) {
    return this.prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug || this.slugify(body.name),
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
    return this.prisma.country.findMany({ orderBy: { id: 'asc' } });
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

  @Get('currencies')
  listCurrencies() {
    return ['AED', 'USD', 'SAR', 'QAR', 'OMR', 'KWD', 'INR'];
  }

  @Get('price-units')
  async listPriceUnits() {
    await this.ensureDefaultPriceUnits();
    return this.prisma.priceUnitMaster.findMany({
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });
  }

  @Post('price-units')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async createPriceUnit(@Body() body: PriceUnitPayload) {
    const payload = this.normalizePriceUnitPayload(body);
    await this.ensurePriceUnitUnique(payload.code);
    return this.prisma.priceUnitMaster.create({ data: payload });
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
      requiresHourRange: body.requiresHourRange ?? existing.requiresHourRange,
      requiresPersonRange: body.requiresPersonRange ?? existing.requiresPersonRange,
      requiresPieceRange: body.requiresPieceRange ?? existing.requiresPieceRange,
    });
    await this.ensurePriceUnitUnique(payload.code, id);
    return this.prisma.priceUnitMaster.update({
      where: { id },
      data: payload,
    });
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

  private normalizePriceUnitPayload(body: PriceUnitPayload) {
    const code = body.code.trim();
    const label = body.label.trim();
    if (!code || !label) {
      throw new BadRequestException('Code and label are required');
    }

    return {
      code,
      label,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
      requiresHourRange: body.requiresHourRange ?? false,
      requiresPersonRange: body.requiresPersonRange ?? false,
      requiresPieceRange: false,
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
            isActive: unit.isActive ?? true,
            sortOrder: unit.sortOrder ?? 0,
            requiresHourRange: unit.requiresHourRange ?? false,
            requiresPersonRange: unit.requiresPersonRange ?? false,
            requiresPieceRange: false,
          },
        });
      }
    }

    const perPieceUnit = await this.prisma.priceUnitMaster.findMany({
      where: {
        OR: [{ code: 'per piece' }, { label: 'Per Piece' }],
      },
      select: { id: true },
    });
    for (const unit of perPieceUnit) {
      await this.prisma.priceUnitMaster.update({
        where: { id: unit.id },
        data: { isActive: false, requiresPieceRange: false },
      });
    }
  }
}
