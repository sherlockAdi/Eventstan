import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('intent')
  @ApiCreatedResponse({ description: 'Creates a Stripe-style payment intent for advance/full/remaining payment.' })
  createIntent(@Body() dto: CreatePaymentDto) {
    return this.payments.createIntent(dto);
  }

  @Patch(':paymentId/succeed')
  markSucceeded(@Param('paymentId') paymentId: string) {
    return this.payments.markSucceeded(paymentId);
  }

  @Get()
  list() {
    return this.payments.list();
  }
}
