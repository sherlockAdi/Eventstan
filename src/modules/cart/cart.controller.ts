import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartService } from './cart.service';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Post('items')
  @ApiCreatedResponse({ description: 'Adds a service or package to the customer cart.' })
  addItem(@Body() dto: AddCartItemDto) {
    return this.cart.addItem(dto);
  }

  @Get(':customerId')
  @ApiOkResponse({ description: 'Gets current customer cart.' })
  getCart(@Param('customerId') customerId: string) {
    return this.cart.getCart(customerId);
  }

  @Delete(':customerId')
  clear(@Param('customerId') customerId: string) {
    this.cart.clear(customerId);
    return { customerId, cleared: true };
  }
}
