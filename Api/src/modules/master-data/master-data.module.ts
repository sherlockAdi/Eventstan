import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { MasterDataController } from './master-data.controller';

@Module({ imports: [PrismaModule], controllers: [MasterDataController] })
export class MasterDataModule {}
