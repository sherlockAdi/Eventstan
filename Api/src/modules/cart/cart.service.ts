import { Injectable, NotFoundException } from '@nestjs/common';
import { CartItemType, PromotionDiscountType } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private packageAmount(item: {
    exactPrice: number;
    isPromotional: boolean;
    promotionDiscountType: PromotionDiscountType | null;
    promotionDiscountValue: number | null;
  }) {
    if (!item.isPromotional || !item.promotionDiscountType || !item.promotionDiscountValue) return item.exactPrice;
    if (item.promotionDiscountType === PromotionDiscountType.FLAT) {
      return Math.max(0, item.exactPrice - item.promotionDiscountValue);
    }
    return Math.max(0, item.exactPrice - Math.round((item.exactPrice * item.promotionDiscountValue) / 100));
  }

  async addItem(dto: AddCartItemDto & { customerId: string }) {
    await this.ensureCustomer(dto.customerId);
    await this.ensureItem(dto.type, dto.itemId);

    const cart = await this.prisma.cart.upsert({
      where: { customerId: dto.customerId },
      update: {},
      create: { customerId: dto.customerId },
    });

    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        type: dto.type as CartItemType,
        itemId: dto.itemId,
        eventDate: this.date(dto.eventDate),
      },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          type: dto.type as CartItemType,
          itemId: dto.itemId,
          eventDate: this.date(dto.eventDate),
          quantity: dto.quantity,
        },
      });
    }

    return this.getCart(dto.customerId);
  }

  async getCart(customerId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: { items: { orderBy: { id: 'asc' } } },
    });
    if (!cart) return { customerId, items: [] };

    const packageIds = cart.items.filter((item) => item.type === CartItemType.PACKAGE).map((item) => item.itemId);
    const packages = await this.prisma.eventPackage.findMany({ where: { id: { in: packageIds } } });

    type ItemDetails = { title: string; amount: number; currency: string; vendorId: string };
    const details = new Map<string, ItemDetails>();
    for (const item of packages) {
      details.set(item.id, { title: item.title, amount: this.packageAmount(item), currency: item.currency, vendorId: item.vendorId });
    }

    return {
      id: cart.id,
      customerId,
      items: cart.items.map((item) => ({
        ...item,
        eventDate: item.eventDate.toISOString().slice(0, 10),
        ...(details.get(item.itemId) ?? {}),
      })),
    };
  }

  async clear(customerId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) return;
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  private async ensureCustomer(customerId: string) {
    const customer = await this.prisma.user.findUnique({ where: { id: customerId } });
    if (!customer || customer.role !== 'CUSTOMER') throw new NotFoundException('Customer not found');
  }

  private async ensureItem(type: AddCartItemDto['type'], itemId: string) {
    const item = await this.prisma.eventPackage.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Cart item not found');
  }

  private date(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }
}
