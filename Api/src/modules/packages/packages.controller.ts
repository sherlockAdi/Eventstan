import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreatePackageDto } from './dto/create-package.dto';
import { PackagesService } from './packages.service';

@ApiTags('packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly packages: PackagesService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Vendor creates a package from multiple services.' })
  create(@Body() dto: CreatePackageDto) {
    return this.packages.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lists active packages.' })
  findAll() {
    return this.packages.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePackageDto> & { status?: string }) {
    return this.packages.update(id, dto);
  }

  @Patch(':id')
  updatePartial(@Param('id') id: string, @Body() dto: Partial<CreatePackageDto> & { status?: string }) {
    return this.packages.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.packages.delete(id);
  }
}
