import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BookingStatus } from '../../shared/data-store/data-store.service';
import { BookingsService } from './bookings.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post('checkout')
  @ApiCreatedResponse({ description: 'Creates booking from cart and reserves vendor calendar capacity.' })
  createFromCart(@Body() dto: CreateBookingDto) {
    return this.bookings.createFromCart(dto);
  }

  @Get()
  @ApiQuery({ name: 'status', required: false })
  @ApiOkResponse({ description: 'Lists bookings by lifecycle status.' })
  findAll(@Query('status') status?: BookingStatus) {
    return this.bookings.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookings.findOne(id);
  }

  @Get(':id/refund-estimate')
  estimateRefund(@Param('id') id: string, @Query('cancelledBy') cancelledBy?: string) {
    return this.bookings.estimateRefund(id, cancelledBy);
  }

  @Patch(':id/vendor-accept')
  vendorAccept(@Param('id') id: string) {
    return this.bookings.vendorAccept(id);
  }

  @Patch(':id/vendor-reject')
  vendorReject(@Param('id') id: string) {
    return this.bookings.vendorReject(id);
  }

  @Patch(':id/customer-confirm')
  customerConfirm(@Param('id') id: string) {
    return this.bookings.customerConfirm(id);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.bookings.complete(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.bookings.cancel(id, dto);
  }
}
