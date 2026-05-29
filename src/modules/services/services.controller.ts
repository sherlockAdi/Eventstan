import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServicesService } from './services.service';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Vendor creates a bookable service.' })
  create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiOkResponse({ description: 'Customer searches active vendor services.' })
  search(@Query('categoryId') categoryId?: string, @Query('city') city?: string) {
    return this.services.search(categoryId, city);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.services.findOne(id);
  }
}
