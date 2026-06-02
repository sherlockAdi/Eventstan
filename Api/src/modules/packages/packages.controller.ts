import { Body, Controller, Get, Post } from '@nestjs/common';
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
}
