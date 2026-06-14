import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { MailModule } from '../mail/mail.module';

@Module({ imports: [AuthModule, PrismaModule, MailModule], controllers: [VendorsController], providers: [VendorsService] })
export class VendorsModule {}
