import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServicesService } from './services.service';
import type { Request } from 'express';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Vendor creates a bookable service.' })
  async create(@Req() request: AuthenticatedRequest, @Body() dto: CreateServiceDto) {
    const vendorId = request.user.role === UserRole.VENDOR ? await this.services.vendorIdForUser(request.user.id) : dto.vendorId;
    return this.services.create({ ...dto, vendorId });
  }

  @Get()
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'includeAll', required: false })
  @ApiOkResponse({ description: 'Customer searches active vendor services.' })
  @UseGuards(OptionalAuthGuard)
  async search(
    @Req() request: Request & { user?: AuthenticatedRequest['user'] },
    @Query('categoryId') categoryId?: string,
    @Query('city') city?: string,
    @Query('includeAll') includeAll?: string,
  ) {
    const canIncludeAll = request.user?.role === UserRole.ADMIN || request.user?.role === UserRole.SUPER_ADMIN || request.user?.role === UserRole.VENDOR;
    const vendorId = request.user?.role === UserRole.VENDOR ? await this.services.vendorIdForUser(request.user.id) : undefined;
    return this.services.search(categoryId, city, includeAll === 'true' && canIncludeAll, vendorId);
  }

  @Get('slug-availability')
  async slugAvailability(@Query('slug') slug?: string, @Query('excludeId') excludeId?: string) {
    return this.services.checkSlugAvailability(slug ?? '', excludeId);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() dto: Partial<CreateServiceDto> & { status?: string }) {
    await this.services.assertCanManage(request.user, id);
    const update = request.user.role === UserRole.VENDOR ? { ...dto, vendorId: undefined } : dto;
    return this.services.update(id, update);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async patch(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() dto: Partial<CreateServiceDto> & { status?: string }) {
    await this.services.assertCanManage(request.user, id);
    const update = request.user.role === UserRole.VENDOR ? { ...dto, vendorId: undefined } : dto;
    return this.services.update(id, update);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async delete(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    await this.services.assertCanManage(request.user, id);
    return this.services.delete(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.services.findOne(id);
  }
}
