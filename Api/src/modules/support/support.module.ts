import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { VendorsModule } from '../vendors/vendors.module';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

@Module({
  imports: [AuthModule, PrismaModule, MailModule, VendorsModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
