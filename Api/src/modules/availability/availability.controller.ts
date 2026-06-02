import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';

@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Put()
  @ApiOkResponse({ description: 'Creates or updates vendor availability for a date.' })
  upsert(@Body() dto: UpsertAvailabilityDto) {
    return this.availability.upsert(dto);
  }

  @Get('vendors/:vendorId')
  list(@Param('vendorId') vendorId: string) {
    return this.availability.list(vendorId);
  }
}
