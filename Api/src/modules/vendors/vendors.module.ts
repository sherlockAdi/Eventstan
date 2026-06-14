import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({ imports: [AuthModule, PrismaModule], controllers: [VendorsController], providers: [VendorsService] })
export class VendorsModule {}
