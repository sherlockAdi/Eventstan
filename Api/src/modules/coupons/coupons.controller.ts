import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Admin creates a coupon or promotional code.' })
  create(@Body() dto: CreateCouponDto) {
    return this.coupons.create(dto);
  }

  @Get()
  list() {
    return this.coupons.list();
  }

  @Get(':code/validate')
  @ApiQuery({ name: 'amount', example: 10000 })
  validate(@Param('code') code: string, @Query('amount') amount: string) {
    return this.coupons.validate(code, Number(amount));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCouponDto>) {
    return this.coupons.update(id, dto);
  }

  @Patch(':id')
  updatePartial(@Param('id') id: string, @Body() body: Partial<CreateCouponDto>) {
    return this.coupons.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.coupons.delete(id);
  }
}
