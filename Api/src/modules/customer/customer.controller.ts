import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { BookNowDto } from './dto/book-now.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { RemoveCartItemDto } from './dto/remove-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CustomerService } from './customer.service';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customer: CustomerService) {}

  @Post('cart')
  @ApiCreatedResponse({ description: 'Add package to cart.' })
  addToCart(@Body() dto: AddToCartDto) {
    return this.customer.addToCart(dto);
  }

  @Get('cart/:userId')
  @ApiOkResponse({ description: 'Get customer cart.' })
  getCart(@Param('userId') userId: string) {
    return this.customer.getCart(userId);
  }

  @Put('cart/:cartItemId')
  @ApiOkResponse({ description: 'Update customer cart item.' })
  updateCartItem(@Param('cartItemId') cartItemId: string, @Body() dto: UpdateCartItemDto) {
    return this.customer.updateCartItem(cartItemId, dto);
  }

  @Delete('cart/:cartItemId')
  @ApiOkResponse({ description: 'Remove customer cart item.' })
  removeCartItem(@Param('cartItemId') cartItemId: string, @Body() dto: RemoveCartItemDto) {
    return this.customer.removeCartItem(cartItemId, dto.userId);
  }

  @Post('book-now')
  @ApiCreatedResponse({ description: 'Create booking immediately for a package.' })
  bookNow(@Body() dto: BookNowDto) {
    return this.customer.bookNow(dto);
  }

  @Post('checkout')
  @ApiCreatedResponse({ description: 'Checkout customer cart items.' })
  checkout(@Body() dto: CheckoutDto) {
    return this.customer.checkout(dto);
  }
}
