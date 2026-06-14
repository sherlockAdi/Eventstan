import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateSubServiceDto } from './dto/create-sub-service.dto';
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

  @Post(':id/sub-services')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Vendor creates a separately stored sub-service under a service.' })
  async createSubService(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() dto: CreateSubServiceDto) {
    await this.services.assertCanManage(request.user, id);
    return this.services.createSubService(id, dto);
  }

  @Get('sub-services')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin lists all vendor sub-services.' })
  findAllSubServices() {
    return this.services.findAllSubServices();
  }

  @Put('sub-services/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async updateSubService(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() dto: Partial<CreateSubServiceDto> & { status?: string }) {
    await this.services.assertCanManageSubService(request.user, id);
    return this.services.updateSubService(id, dto);
  }

  @Delete('sub-services/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async deleteSubService(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    await this.services.assertCanManageSubService(request.user, id);
    return this.services.deleteSubService(id);
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

  @Get(':id/sub-services')
  @ApiOkResponse({ description: 'Lists active sub-services for a service.' })
  findSubServices(@Param('id') id: string) {
    return this.services.findSubServices(id);
  }
}
