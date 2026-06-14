import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { SubServicesController } from './sub-services.controller';

@Module({
  imports: [AuthModule],
  controllers: [ServicesController, SubServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
