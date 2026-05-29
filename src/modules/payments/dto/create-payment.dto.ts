import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'bkg_123' })
  @IsString()
  bookingId!: string;

  @ApiProperty({ enum: ['ADVANCE', 'REMAINING', 'FULL'], example: 'ADVANCE' })
  @IsIn(['ADVANCE', 'REMAINING', 'FULL'])
  paymentType!: string;
}
