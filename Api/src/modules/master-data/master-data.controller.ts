import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
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

@ApiTags('master-data')
@Controller('master-data')
export class MasterDataController {
  constructor(private readonly prisma: PrismaService) {}

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
}
