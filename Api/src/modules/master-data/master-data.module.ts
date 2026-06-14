import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MasterDataController } from './master-data.controller';

@Module({ imports: [AuthModule, PrismaModule], controllers: [MasterDataController] })
export class MasterDataModule {}
