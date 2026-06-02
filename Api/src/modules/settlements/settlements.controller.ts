import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementsService } from './settlements.service';

@ApiTags('settlements')
@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlements: SettlementsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Creates vendor settlement after event completion.' })
  create(@Body() dto: CreateSettlementDto) {
    return this.settlements.create(dto);
  }

  @Get()
  list() {
    return this.settlements.list();
  }

  @Patch(':id/mark-paid')
  markPaid(@Param('id') id: string) {
    return this.settlements.markPaid(id);
  }
}
