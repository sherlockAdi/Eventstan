import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus, PromotionDiscountType, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { BookNowDto } from './dto/book-now.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

type DbClient = PrismaService | Prisma.TransactionClient;

type CustomerCartRow = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type CustomerCartItemRow = {
  id: string;
  cartId: string;
  userId: string;
  packageId: string;
  vendorId: string;
  title: string;
  category: string;
  quantity: number;
  unitPrice: number;
  priceUnit: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
};

type CustomerBookingRow = {
  id: string;
  checkoutId: string | null;
  userId: string;
  packageId: string;
  vendorId: string;
  title: string;
  category: string;
  quantity: number;
  unitPrice: number;
  priceUnit: string;
  totalPrice: number;
  eventDate: Date;
  eventType: string;
  guestCount: number;
  message: string | null;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
};

type CustomerCheckoutRow = {
  id: string;
  orderId: string;
  userId: string;
  eventDate: Date;
  eventType: string;
  guestCount: number;
  message: string | null;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  subtotal: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(dto: AddToCartDto) {
    const quantity = this.assertPositiveInteger(dto.quantity, 'quantity');
    const customer = await this.findCustomer(dto.userId);
    const eventPackage = await this.findPackage(dto.packageId);
    const unitPrice = this.packageAmount(eventPackage);

    return this.prisma.$transaction(async (tx) => {
      const cart = await this.ensureCart(tx, customer.id);
      const item = await tx.$queryRaw<CustomerCartItemRow[]>`
        INSERT INTO customer_cart_items (
          id,
          "cartId",
          "userId",
          "packageId",
          "vendorId",
          title,
          category,
          quantity,
          "unitPrice",
          "priceUnit",
          "totalPrice",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${randomUUID()},
          ${cart.id},
          ${customer.id},
          ${eventPackage.id},
          ${eventPackage.vendorId},
          ${eventPackage.title},
          ${eventPackage.category?.name ?? 'Package'},
          ${quantity},
          ${unitPrice},
          ${eventPackage.priceUnit},
          ${unitPrice * quantity},
          NOW(),
          NOW()
        )
        ON CONFLICT ("cartId", "packageId")
        DO UPDATE SET
          quantity = customer_cart_items.quantity + EXCLUDED.quantity,
          "totalPrice" = customer_cart_items."unitPrice" * (customer_cart_items.quantity + EXCLUDED.quantity),
          "updatedAt" = NOW()
        RETURNING
          id,
          "cartId",
          "userId",
          "packageId",
          "vendorId",
          title,
          category,
          quantity,
          "unitPrice",
          "priceUnit",
          "totalPrice",
          "createdAt",
          "updatedAt";
      `;

      return {
        success: true,
        message: 'Package added to cart successfully',
        data: this.toCartItemResponse(item[0]),
      };
    });
  }

  async getCart(userId: string) {
    await this.findCustomer(userId);
    const items = await this.prisma.$queryRaw<CustomerCartItemRow[]>`
      SELECT
        id,
        "cartId",
        "userId",
        "packageId",
        "vendorId",
        title,
        category,
        quantity,
        "unitPrice",
        "priceUnit",
        "totalPrice",
        "createdAt",
        "updatedAt"
      FROM customer_cart_items
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" ASC;
    `;

    return {
      success: true,
      message: 'Cart fetched successfully',
      data: {
        items: items.map((item) => this.toCartItemResponse(item)),
        itemCount: items.length,
        estimatedTotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
      },
    };
  }

  async updateCartItem(cartItemId: string, dto: UpdateCartItemDto) {
    const quantity = this.assertPositiveInteger(dto.quantity, 'quantity');
    await this.findCustomer(dto.userId);

    const existing = await this.prisma.$queryRaw<CustomerCartItemRow[]>`
      SELECT
        id,
        "cartId",
        "userId",
        "packageId",
        "vendorId",
        title,
        category,
        quantity,
        "unitPrice",
        "priceUnit",
        "totalPrice",
        "createdAt",
        "updatedAt"
      FROM customer_cart_items
      WHERE id = ${cartItemId} AND "userId" = ${dto.userId}
      LIMIT 1;
    `;

    if (!existing.length) {
      throw new NotFoundException('Cart item not found');
    }

    const updated = await this.prisma.$queryRaw<CustomerCartItemRow[]>`
      UPDATE customer_cart_items
      SET quantity = ${quantity},
          "totalPrice" = "unitPrice" * ${quantity},
          "updatedAt" = NOW()
      WHERE id = ${cartItemId} AND "userId" = ${dto.userId}
      RETURNING
        id,
        "cartId",
        "userId",
        "packageId",
        "vendorId",
        title,
        category,
        quantity,
        "unitPrice",
        "priceUnit",
        "totalPrice",
        "createdAt",
        "updatedAt";
    `;

    return {
      success: true,
      message: 'Cart updated successfully',
      data: this.toCartItemResponse(updated[0]),
    };
  }

  async removeCartItem(cartItemId: string, userId: string) {
    await this.findCustomer(userId);
    const deleted = await this.prisma.$queryRaw<CustomerCartItemRow[]>`
      DELETE FROM customer_cart_items
      WHERE id = ${cartItemId} AND "userId" = ${userId}
      RETURNING
        id,
        "cartId",
        "userId",
        "packageId",
        "vendorId",
        title,
        category,
        quantity,
        "unitPrice",
        "priceUnit",
        "totalPrice",
        "createdAt",
        "updatedAt";
    `;

    if (!deleted.length) {
      throw new NotFoundException('Cart item not found');
    }

    return {
      success: true,
      message: 'Package removed from cart successfully',
    };
  }

  async bookNow(dto: BookNowDto) {
    const customer = await this.findCustomer(dto.userId);
    const eventPackage = await this.findPackage(dto.packageId);
    const eventDate = this.parseDate(dto.eventDate);
    const unitPrice = this.packageAmount(eventPackage);

    const booking = await this.prisma.$queryRaw<CustomerBookingRow[]>`
      INSERT INTO customer_bookings (
        id,
        "userId",
        "packageId",
        "vendorId",
        title,
        category,
        quantity,
        "unitPrice",
        "priceUnit",
        "totalPrice",
        "eventDate",
        "eventType",
        "guestCount",
        message,
        "bookingStatus",
        "paymentStatus",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${randomUUID()},
        ${customer.id},
        ${eventPackage.id},
        ${eventPackage.vendorId},
        ${eventPackage.title},
        ${eventPackage.category?.name ?? 'Package'},
        ${1},
        ${unitPrice},
        ${eventPackage.priceUnit},
        ${unitPrice},
        ${eventDate},
        ${dto.eventType.trim()},
        ${dto.guestCount},
        ${dto.message?.trim() || null},
        ${'Pending'},
        ${'Pending'},
        NOW(),
        NOW()
      )
      RETURNING
        id,
        "checkoutId",
        "userId",
        "packageId",
        "vendorId",
        title,
        category,
        quantity,
        "unitPrice",
        "priceUnit",
        "totalPrice",
        "eventDate",
        "eventType",
        "guestCount",
        message,
        "bookingStatus",
        "paymentStatus",
        "createdAt",
        "updatedAt";
    `;

    return {
      success: true,
      message: 'Booking created successfully',
      data: this.toBookingResponse(booking[0]),
    };
  }

  async checkout(dto: CheckoutDto) {
    const customer = await this.findCustomer(dto.userId);
    const eventDate = this.parseDate(dto.eventDate);
    const uniqueCartItemIds = [...new Set(dto.cartItemIds)];

    return this.prisma.$transaction(async (tx) => {
      const cartItems = await tx.$queryRaw<CustomerCartItemRow[]>`
        SELECT
          id,
          "cartId",
          "userId",
          "packageId",
          "vendorId",
          title,
          category,
          quantity,
          "unitPrice",
          "priceUnit",
          "totalPrice",
          "createdAt",
          "updatedAt"
        FROM customer_cart_items
        WHERE "userId" = ${customer.id}
          AND id = ANY(${uniqueCartItemIds}::uuid[])
        ORDER BY "createdAt" ASC;
      `;

      if (!cartItems.length || cartItems.length !== uniqueCartItemIds.length) {
        throw new NotFoundException('One or more cart items were not found');
      }

      const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const checkoutId = randomUUID();
      const orderId = await this.nextOrderId(tx);

      const checkout = await tx.$queryRaw<CustomerCheckoutRow[]>`
        INSERT INTO customer_checkouts (
          id,
          "orderId",
          "userId",
          "eventDate",
          "eventType",
          "guestCount",
          message,
          "paymentMethod",
          "paymentStatus",
          "bookingStatus",
          subtotal,
          "totalAmount",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${checkoutId},
          ${orderId},
          ${customer.id},
          ${eventDate},
          ${dto.eventType.trim()},
          ${dto.guestCount},
          ${dto.message?.trim() || null},
          ${dto.paymentMethod.trim()},
          ${'Pending'},
          ${'Pending'},
          ${subtotal},
          ${subtotal},
          NOW(),
          NOW()
        )
        RETURNING
          id,
          "orderId",
          "userId",
          "eventDate",
          "eventType",
          "guestCount",
          message,
          "paymentMethod",
          "paymentStatus",
          "bookingStatus",
          subtotal,
          "totalAmount",
          "createdAt",
          "updatedAt";
      `;

      const bookings: CustomerBookingRow[] = [];
      for (const item of cartItems) {
        const inserted = await tx.$queryRaw<CustomerBookingRow[]>`
          INSERT INTO customer_bookings (
            id,
            "checkoutId",
            "userId",
            "packageId",
            "vendorId",
            title,
            category,
            quantity,
            "unitPrice",
            "priceUnit",
            "totalPrice",
            "eventDate",
            "eventType",
            "guestCount",
            message,
            "bookingStatus",
            "paymentStatus",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${randomUUID()},
            ${checkoutId},
            ${customer.id},
            ${item.packageId},
            ${item.vendorId},
            ${item.title},
            ${item.category},
            ${item.quantity},
            ${item.unitPrice},
            ${item.priceUnit},
            ${item.totalPrice},
            ${eventDate},
            ${dto.eventType.trim()},
            ${dto.guestCount},
            ${dto.message?.trim() || null},
            ${'Pending'},
            ${'Pending'},
            NOW(),
            NOW()
          )
          RETURNING
            id,
            "checkoutId",
            "userId",
            "packageId",
            "vendorId",
            title,
            category,
            quantity,
            "unitPrice",
            "priceUnit",
            "totalPrice",
            "eventDate",
            "eventType",
            "guestCount",
            message,
            "bookingStatus",
            "paymentStatus",
            "createdAt",
            "updatedAt";
        `;
        bookings.push(inserted[0]);
      }

      await tx.$executeRaw`
        DELETE FROM customer_cart_items
        WHERE "userId" = ${customer.id}
          AND id = ANY(${uniqueCartItemIds}::uuid[]);
      `;

      return {
        success: true,
        message: 'Checkout completed successfully.',
        data: {
          checkoutId: checkout[0].id,
          orderId: checkout[0].orderId,
          userId: checkout[0].userId,
          bookingCount: bookings.length,
          eventDate: checkout[0].eventDate.toISOString().slice(0, 10),
          eventType: checkout[0].eventType,
          guestCount: checkout[0].guestCount,
          paymentMethod: checkout[0].paymentMethod,
          paymentStatus: checkout[0].paymentStatus,
          bookingStatus: checkout[0].bookingStatus,
          subtotal: checkout[0].subtotal,
          totalAmount: checkout[0].totalAmount,
          items: bookings.map((booking) => this.toCheckoutItemResponse(booking)),
        },
      };
    });
  }

  private async findCustomer(userId: string) {
    const customer = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!customer || customer.role !== 'CUSTOMER') {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  private async findPackage(packageId: string) {
    const eventPackage = await this.prisma.eventPackage.findUnique({
      where: { id: packageId },
      include: {
        category: true,
      },
    });
    if (!eventPackage || eventPackage.status !== ListingStatus.ACTIVE) {
      throw new NotFoundException('Package not found');
    }
    return eventPackage;
  }

  private packageAmount(eventPackage: {
    exactPrice: number;
    isPromotional: boolean;
    promotionDiscountType: PromotionDiscountType | null;
    promotionDiscountValue: number | null;
  }) {
    if (!eventPackage.isPromotional || !eventPackage.promotionDiscountType || !eventPackage.promotionDiscountValue) {
      return eventPackage.exactPrice;
    }

    if (eventPackage.promotionDiscountType === PromotionDiscountType.FLAT) {
      return Math.max(0, eventPackage.exactPrice - eventPackage.promotionDiscountValue);
    }

    return Math.max(0, eventPackage.exactPrice - Math.round((eventPackage.exactPrice * eventPackage.promotionDiscountValue) / 100));
  }

  private toCartItemResponse(item: CustomerCartItemRow) {
    return {
      cartItemId: item.id,
      userId: item.userId,
      packageId: item.packageId,
      vendorId: item.vendorId,
      title: item.title,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      priceUnit: item.priceUnit,
      totalPrice: item.totalPrice,
    };
  }

  private toBookingResponse(item: CustomerBookingRow) {
    return {
      bookingId: item.id,
      userId: item.userId,
      packageId: item.packageId,
      vendorId: item.vendorId,
      eventDate: item.eventDate.toISOString().slice(0, 10),
      eventType: item.eventType,
      guestCount: item.guestCount,
      unitPrice: item.unitPrice,
      priceUnit: item.priceUnit,
      totalPrice: item.totalPrice,
      bookingStatus: item.bookingStatus,
      paymentStatus: item.paymentStatus,
    };
  }

  private toCheckoutItemResponse(item: CustomerBookingRow) {
    return {
      bookingId: item.id,
      packageId: item.packageId,
      vendorId: item.vendorId,
      title: item.title,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      priceUnit: item.priceUnit,
      totalPrice: item.totalPrice,
    };
  }

  private parseDate(value: string) {
    const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    return date;
  }

  private assertPositiveInteger(value: number, fieldName: string) {
    if (!Number.isInteger(value) || value < 1) {
      throw new BadRequestException(`${fieldName} must be greater than 0`);
    }
    return value;
  }

  private async ensureCart(tx: DbClient, userId: string): Promise<CustomerCartRow> {
    const cartRows = await tx.$queryRaw<CustomerCartRow[]>`
      INSERT INTO customer_carts (id, "userId", "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${userId}, NOW(), NOW())
      ON CONFLICT ("userId")
      DO UPDATE SET "updatedAt" = NOW()
      RETURNING
        id,
        "userId",
        "createdAt",
        "updatedAt";
    `;

    if (!cartRows[0]) {
      throw new BadRequestException('Unable to create cart');
    }
    return cartRows[0];
  }

  private async nextOrderId(tx: DbClient) {
    const orderRows = await tx.$queryRaw<Array<{ orderId: string }>>`
      SELECT CONCAT('ORD', (10000 + COUNT(*) + 1)::text) AS "orderId"
      FROM customer_checkouts;
    `;
    return orderRows[0]?.orderId ?? `ORD${Date.now()}`;
  }
}
