import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SettlementStatus, UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementsService } from './settlements.service';

@ApiTags('settlements')
@Controller('settlements')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class SettlementsController {
  constructor(private readonly settlements: SettlementsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Creates vendor settlement after event completion.' })
  create(@Body() dto: CreateSettlementDto) {
    return this.settlements.create(dto);
  }

  @Get()
  list(@Query('vendorId') vendorId?: string, @Query('status') status?: SettlementStatus) {
    return this.settlements.list(vendorId, status);
  }

  @Patch(':id/mark-paid')
  markPaid(@Param('id') id: string) {
    return this.settlements.markPaid(id);
  }
}
