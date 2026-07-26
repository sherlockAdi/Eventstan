import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserLeadsController } from './user-leads.controller';
import { UserLeadsService } from './user-leads.service';
import { VendorLeadsController } from './vendor-leads.controller';
import { VendorLeadsService } from './vendor-leads.service';

@Module({
  imports: [AuthModule],
  controllers: [UserLeadsController, VendorLeadsController],
  providers: [UserLeadsService, VendorLeadsService],
})
export class LeadsModule {}
