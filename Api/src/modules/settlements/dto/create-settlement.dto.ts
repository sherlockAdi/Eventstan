import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSettlementDto {
  @ApiProperty({ example: 'bkg_123' })
  @IsString()
  bookingId!: string;
}
