import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive, IsString, Min } from 'class-validator';

export class BudgetRangeDto {
  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  min!: number;

  @ApiProperty({ example: 80000 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  max!: number;

  @ApiProperty({ example: 'AED' })
  @IsString()
  currency!: string;
}
