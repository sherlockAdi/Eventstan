import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ example: 'EVENT10' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: ['FLAT', 'PERCENTAGE'], example: 'PERCENTAGE' })
  @IsIn(['FLAT', 'PERCENTAGE'])
  type!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  value!: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiProperty({ example: 'AED' })
  @IsString()
  currency!: string;

  @ApiProperty({ example: 5000 })
  @IsInt()
  @Min(0)
  minOrderAmount!: number;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  expiresAt!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  active!: boolean;
}
