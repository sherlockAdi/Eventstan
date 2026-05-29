import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';

@Module({ imports: [BookingsModule], controllers: [SettlementsController], providers: [SettlementsService] })
export class SettlementsModule {}
