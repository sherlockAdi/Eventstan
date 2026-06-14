import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';

@Module({ imports: [AuthModule, PrismaModule], controllers: [CouponsController], providers: [CouponsService] })
export class CouponsModule {}
