import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BookingStatus, UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BookingsService } from './bookings.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post('checkout')
  @ApiCreatedResponse({ description: 'Creates booking from cart and reserves vendor calendar capacity.' })
  @Roles(UserRole.CUSTOMER)
  createFromCart(@Req() request: AuthenticatedRequest, @Body() dto: CreateBookingDto) {
    return this.bookings.createFromCart({ ...dto, customerId: request.user.id });
  }

  @Get()
  @ApiQuery({ name: 'status', required: false })
  @ApiOkResponse({ description: 'Lists bookings by lifecycle status.' })
  findAll(@Req() request: AuthenticatedRequest, @Query('status') status?: BookingStatus) {
    return this.bookings.findForUser(request.user, status);
  }

  @Get(':id')
  findOne(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.bookings.findAccessible(request.user, id);
  }

  @Get(':id/refund-estimate')
  estimateRefund(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.bookings.estimateRefundForUser(request.user, id);
  }

  @Patch(':id/vendor-accept')
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async vendorAccept(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    await this.bookings.findAccessible(request.user, id);
    return this.bookings.vendorAccept(id);
  }

  @Patch(':id/vendor-reject')
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async vendorReject(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    await this.bookings.findAccessible(request.user, id);
    return this.bookings.vendorReject(id);
  }

  @Patch(':id/customer-confirm')
  @Roles(UserRole.CUSTOMER)
  async customerConfirm(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    await this.bookings.findAccessible(request.user, id);
    return this.bookings.customerConfirm(id);
  }

  @Patch(':id/complete')
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async complete(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    await this.bookings.findAccessible(request.user, id);
    return this.bookings.complete(id);
  }

  @Patch(':id/cancel')
  cancel(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.bookings.cancelForUser(request.user, id, dto);
  }
}
