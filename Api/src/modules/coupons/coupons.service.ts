import { BadRequestException, Injectable } from '@nestjs/common';
import { DataStoreService } from '../../shared/data-store/data-store.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly store: DataStoreService) {}

  create(dto: CreateCouponDto) {
    if (this.store.coupons.some((item) => item.code === dto.code)) throw new BadRequestException('Coupon code already exists');
    const coupon = { id: this.store.nextId('cpn'), ...dto, maxDiscountAmount: dto.maxDiscountAmount ?? dto.value };
    this.store.coupons.push(coupon);
    return coupon;
  }

  list() {
    return this.store.coupons;
  }

  validate(code: string, amount: number) {
    const coupon = this.store.coupons.find((item) => item.code === code && item.active);
    if (!coupon) throw new BadRequestException('Invalid coupon');
    if (amount < coupon.minOrderAmount) throw new BadRequestException('Minimum order amount not reached');
    const discount = coupon.type === 'PERCENTAGE'
      ? Math.min(Math.round((amount * coupon.value) / 100), coupon.maxDiscountAmount ?? amount)
      : coupon.value;
    return { code, valid: true, discount: { amount: discount, currency: coupon.currency } };
  }
}
