import { BadRequestException, Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AvailabilityService } from './availability.service';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';

@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Put()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Creates or updates vendor availability for a date.' })
  async upsert(@Req() request: AuthenticatedRequest, @Body() dto: UpsertAvailabilityDto) {
    const vendorId =
      request.user.role === UserRole.VENDOR
        ? await this.availability.vendorIdForUser(request.user.id)
        : dto.vendorId;
    if (!vendorId) throw new BadRequestException('vendorId is required for administrators');
    return this.availability.upsert({ ...dto, vendorId });
  }

  @Get('vendors/:vendorId')
  list(@Param('vendorId') vendorId: string) {
    return this.availability.list(vendorId);
  }
}
