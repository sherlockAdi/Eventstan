import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { VendorStatus } from '../../shared/data-store/data-store.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import { VendorsService } from './vendors.service';

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendors: VendorsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Admin creates a vendor in pending verification state.' })
  create(@Body() dto: CreateVendorDto) {
    return this.vendors.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING_VERIFICATION', 'APPROVED', 'SUSPENDED', 'REJECTED'] })
  @ApiOkResponse({ description: 'Lists vendors, optionally filtered by verification status.' })
  findAll(@Query('status') status?: VendorStatus) {
    return this.vendors.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendors.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateVendorStatusDto) {
    return this.vendors.updateStatus(id, dto.status as VendorStatus, dto.reason);
  }
}
