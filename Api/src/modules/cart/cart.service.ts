import { Injectable, NotFoundException } from '@nestjs/common';
import { DataStoreService } from '../../shared/data-store/data-store.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly store: DataStoreService) {}

  addItem(dto: AddCartItemDto) {
    const collection = dto.type === 'SERVICE' ? this.store.services : this.store.packages;
    if (!collection.some((item) => item.id === dto.itemId)) throw new NotFoundException('Cart item not found');
    const item = { id: this.store.nextId('cart'), type: dto.type, itemId: dto.itemId, eventDate: dto.eventDate, quantity: dto.quantity };
    this.store.carts[dto.customerId] = [...(this.store.carts[dto.customerId] ?? []), item];
    return this.getCart(dto.customerId);
  }

  getCart(customerId: string) {
    const items = this.store.carts[customerId] ?? [];
    return { customerId, items };
  }

  clear(customerId: string) {
    this.store.carts[customerId] = [];
  }
}
