import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('intent')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiCreatedResponse({ description: 'Creates a Stripe-style payment intent for advance/full/remaining payment.' })
  createIntent(@Req() request: AuthenticatedRequest, @Body() dto: CreatePaymentDto) {
    return this.payments.createIntent(dto, request.user);
  }

  @Patch(':paymentId/succeed')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  markSucceeded(@Param('paymentId') paymentId: string) {
    return this.payments.markSucceeded(paymentId);
  }

  @Patch(':paymentId/fail')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  markFailed(@Param('paymentId') paymentId: string) {
    return this.payments.markFailed(paymentId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  list(@Query('bookingId') bookingId?: string) {
    return this.payments.list(bookingId);
  }
}
