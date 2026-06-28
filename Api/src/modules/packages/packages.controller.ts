import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreatePackageDto } from './dto/create-package.dto';
import { PackagesService } from './packages.service';

@ApiTags('packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly packages: PackagesService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Vendor creates a sellable package for one service.' })
  async create(@Req() request: AuthenticatedRequest, @Body() dto: CreatePackageDto) {
    const vendorId = request.user.role === UserRole.VENDOR ? await this.packages.vendorIdForUser(request.user.id) : dto.vendorId;
    return this.packages.create({ ...dto, vendorId });
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOkResponse({ description: 'Lists active packages.' })
  async findAll(@Req() request: Request & { user?: AuthenticatedRequest['user'] }) {
    const includeAll = Boolean(request.user && request.user.role !== UserRole.CUSTOMER);
    const vendorId = request.user?.role === UserRole.VENDOR ? await this.packages.vendorIdForUser(request.user.id) : undefined;
    return this.packages.findAll(includeAll, vendorId);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findOne(
    @Req() request: Request & { user?: AuthenticatedRequest['user'] },
    @Param('id') id: string,
  ) {
    return this.packages.findOne(id, request.user);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() dto: Partial<CreatePackageDto> & { status?: string }) {
    await this.packages.assertCanManage(request.user, id);
    const update = request.user.role === UserRole.VENDOR ? { ...dto, vendorId: undefined } : dto;
    return this.packages.update(id, update);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async updatePartial(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() dto: Partial<CreatePackageDto> & { status?: string }) {
    await this.packages.assertCanManage(request.user, id);
    const update = request.user.role === UserRole.VENDOR ? { ...dto, vendorId: undefined } : dto;
    return this.packages.update(id, update);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async delete(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    await this.packages.assertCanManage(request.user, id);
    return this.packages.delete(id);
  }
}
