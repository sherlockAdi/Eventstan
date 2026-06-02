import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateSubServiceDto } from './dto/create-sub-service.dto';
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

  @Post(':id/sub-services')
  @ApiCreatedResponse({ description: 'Vendor creates a separately stored sub-service under a service.' })
  createSubService(@Param('id') id: string, @Body() dto: CreateSubServiceDto) {
    return this.services.createSubService(id, dto);
  }

  @Get('sub-services')
  @ApiOkResponse({ description: 'Admin lists all vendor sub-services.' })
  findAllSubServices() {
    return this.services.findAllSubServices();
  }

  @Put('sub-services/:id')
  updateSubService(@Param('id') id: string, @Body() dto: Partial<CreateSubServiceDto> & { status?: string }) {
    return this.services.updateSubService(id, dto);
  }

  @Delete('sub-services/:id')
  deleteSubService(@Param('id') id: string) {
    return this.services.deleteSubService(id);
  }

  @Get()
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'includeAll', required: false })
  @ApiOkResponse({ description: 'Customer searches active vendor services.' })
  search(@Query('categoryId') categoryId?: string, @Query('city') city?: string, @Query('includeAll') includeAll?: string) {
    return this.services.search(categoryId, city, includeAll === 'true');
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateServiceDto> & { status?: string }) {
    return this.services.update(id, dto);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() dto: Partial<CreateServiceDto> & { status?: string }) {
    return this.services.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.services.delete(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.services.findOne(id);
  }

  @Get(':id/sub-services')
  @ApiOkResponse({ description: 'Lists active sub-services for a service.' })
  findSubServices(@Param('id') id: string) {
    return this.services.findSubServices(id);
  }
}
