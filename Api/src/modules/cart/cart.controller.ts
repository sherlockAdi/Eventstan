import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartService } from './cart.service';

@ApiTags('cart')
@Controller('cart')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Post('items')
  @ApiCreatedResponse({ description: 'Adds a service or package to the customer cart.' })
  addItem(@Req() request: AuthenticatedRequest, @Body() dto: AddCartItemDto) {
    return this.cart.addItem({ ...dto, customerId: request.user.id });
  }

  @Get()
  @ApiOkResponse({ description: 'Gets current customer cart.' })
  getCart(@Req() request: AuthenticatedRequest) {
    return this.cart.getCart(request.user.id);
  }

  @Delete()
  async clear(@Req() request: AuthenticatedRequest) {
    await this.cart.clear(request.user.id);
    return { customerId: request.user.id, cleared: true };
  }
}
