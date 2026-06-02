import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Min } from 'class-validator';

export class MoneyDto {
  @ApiProperty({ example: 25000, description: 'Minor-free amount for v1. Store as integer with currency.' })
  @IsInt()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'AED', enum: ['AED', 'USD', 'SAR', 'QAR', 'OMR', 'KWD'] })
  @IsIn(['AED', 'USD', 'SAR', 'QAR', 'OMR', 'KWD'])
  currency!: string;
}
