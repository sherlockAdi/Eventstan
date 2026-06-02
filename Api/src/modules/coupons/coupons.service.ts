import { BadRequestException, Injectable } from '@nestjs/common';
import { CouponType } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        code: dto.code,
        type: dto.type as CouponType,
        value: dto.value,
        maxDiscountAmount: dto.maxDiscountAmount ?? dto.value,
        currency: dto.currency ?? 'AED',
        minOrderAmount: dto.minOrderAmount ?? 0,
        active: dto.active ?? true,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  list() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async update(id: string, dto: Partial<CreateCouponDto>) {
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.type !== undefined ? { type: dto.type as CouponType } : {}),
        ...(dto.value !== undefined ? { value: dto.value } : {}),
        ...(dto.maxDiscountAmount !== undefined ? { maxDiscountAmount: dto.maxDiscountAmount } : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.minOrderAmount !== undefined ? { minOrderAmount: dto.minOrderAmount } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.expiresAt !== undefined ? { expiresAt: new Date(dto.expiresAt) } : {}),
      },
    });
  }

  async updateStatus(id: string, active: boolean) {
    return this.prisma.coupon.update({ where: { id }, data: { active } });
  }

  async delete(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }

  async validate(code: string, amount: number) {
    const coupon = await this.prisma.coupon.findFirst({ where: { code, active: true } });
    if (!coupon) throw new BadRequestException('Invalid coupon');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Coupon expired');
    if (amount < coupon.minOrderAmount) throw new BadRequestException('Minimum order amount not reached');

    const discountAmount =
      coupon.type === CouponType.PERCENTAGE
        ? Math.min(Math.round((amount * coupon.value) / 100), coupon.maxDiscountAmount ?? amount)
        : coupon.value;

    return {
      code,
      valid: true,
      discountAmount,
      finalAmount: Math.max(0, amount - discountAmount),
      discount: { amount: discountAmount, currency: coupon.currency },
    };
  }
}
