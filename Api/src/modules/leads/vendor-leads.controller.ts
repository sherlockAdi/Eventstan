import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateVendorLeadDto } from './dto/create-vendor-lead.dto';
import { UpdateVendorLeadDto } from './dto/update-vendor-lead.dto';
import { VendorLeadsService } from './vendor-leads.service';

@ApiTags('vendor-leads')
@Controller('vendor-leads')
export class VendorLeadsController {
  constructor(private readonly leads: VendorLeadsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Creates a vendor lead.' })
  create(@Body() dto: CreateVendorLeadDto) {
    return this.leads.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Lists vendor leads.' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  list(@Query('status') status?: string, @Query('search') search?: string) {
    return this.leads.list(status, search);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Gets a vendor lead by id.' })
  findOne(@Param('id') id: string) {
    return this.leads.get(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Updates a vendor lead.' })
  update(@Param('id') id: string, @Body() dto: UpdateVendorLeadDto) {
    return this.leads.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Deletes a vendor lead.' })
  remove(@Param('id') id: string) {
    return this.leads.delete(id);
  }
}
