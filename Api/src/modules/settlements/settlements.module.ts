import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BookingsModule } from '../bookings/bookings.module';
import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';

@Module({ imports: [AuthModule, BookingsModule], controllers: [SettlementsController], providers: [SettlementsService] })
export class SettlementsModule {}
