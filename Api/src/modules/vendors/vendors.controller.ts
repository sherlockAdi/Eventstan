import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole, VendorStatus } from '@prisma/client';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import { VendorsService } from './vendors.service';

@ApiTags('vendors')
@Controller('vendors')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class VendorsController {
  constructor(private readonly vendors: VendorsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiCreatedResponse({ description: 'Admin creates a vendor in pending verification state.' })
  create(@Body() dto: CreateVendorDto) {
    return this.vendors.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING_VERIFICATION', 'APPROVED', 'SUSPENDED', 'REJECTED'] })
  @ApiOkResponse({ description: 'Lists vendors, optionally filtered by verification status.' })
  findAll(@Query('status') status?: VendorStatus) {
    return this.vendors.findAll(status);
  }

  @Get('me')
  @Roles(UserRole.VENDOR)
  findMe(@Req() request: AuthenticatedRequest) {
    return this.vendors.findForUser(request.user.id);
  }

  @Put('me')
  @Roles(UserRole.VENDOR)
  async updateMe(@Req() request: AuthenticatedRequest, @Body() dto: Partial<CreateVendorDto>) {
    const vendor = await this.vendors.findForUser(request.user.id);
    return this.vendors.update(vendor.id, dto);
  }

  @Get(':id')
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findOne(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    await this.vendors.assertCanManage(request.user, id);
    return this.vendors.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateVendorStatusDto) {
    return this.vendors.updateStatus(id, dto.status as VendorStatus, dto.reason);
  }

  @Put(':id')
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() dto: Partial<CreateVendorDto>) {
    await this.vendors.assertCanManage(request.user, id);
    return this.vendors.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  delete(@Param('id') id: string) {
    return this.vendors.delete(id);
  }
}
