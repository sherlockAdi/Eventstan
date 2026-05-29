import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
}
