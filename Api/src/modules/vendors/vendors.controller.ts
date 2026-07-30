import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole, VendorStatus } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VendorOnboardingBypass } from '../auth/vendor-onboarding.decorator';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';
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
  @ApiBody({ type: CreateVendorDto })
  @ApiCreatedResponse({ description: 'Admin creates a vendor in pending verification state.', type: VendorResponseDto })
  create(@Body() dto: CreateVendorDto) {
    return this.vendors.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING_VERIFICATION', 'APPROVED', 'SUSPENDED', 'REJECTED'] })
  @ApiOkResponse({ description: 'Lists vendors, optionally filtered by verification status.', type: VendorResponseDto, isArray: true })
  findAll(@Query('status') status?: VendorStatus) {
    return this.vendors.findAll(status);
  }

  @Get('me')
  @Roles(UserRole.VENDOR)
  @VendorOnboardingBypass()
  @ApiOkResponse({ description: 'Returns the current vendor profile.', type: VendorResponseDto })
  findMe(@Req() request: AuthenticatedRequest) {
    return this.vendors.findForUser(request.user.id);
  }

  @Put('me')
  @Roles(UserRole.VENDOR)
  @VendorOnboardingBypass()
  @ApiBody({ type: UpdateVendorDto })
  @ApiOkResponse({ description: 'Updates the current vendor profile.', type: VendorResponseDto })
  async updateMe(@Req() request: AuthenticatedRequest, @Body() dto: UpdateVendorDto) {
    const vendor = await this.vendors.findForUser(request.user.id);
    return this.vendors.updateProfile(vendor.id, dto);
  }

  @Get(':id')
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOkResponse({ description: 'Returns one vendor.', type: VendorResponseDto })
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
  @ApiBody({ type: UpdateVendorDto })
  @ApiOkResponse({ description: 'Updates a vendor.', type: VendorResponseDto })
  async update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateVendorDto) {
    await this.vendors.assertCanManage(request.user, id);
    return this.vendors.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  delete(@Param('id') id: string) {
    return this.vendors.delete(id);
  }
}
