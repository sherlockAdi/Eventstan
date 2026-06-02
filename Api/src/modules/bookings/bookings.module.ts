import { Module } from '@nestjs/common';
import { AvailabilityModule } from '../availability/availability.module';
import { CartModule } from '../cart/cart.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [AvailabilityModule, CartModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
