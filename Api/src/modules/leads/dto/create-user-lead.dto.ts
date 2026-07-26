import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { BudgetRangeDto } from './budget-range.dto';

export class CreateUserLeadDto {
  @ApiProperty({ example: 'Aisha Khan' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: 'aisha.khan@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+971501234567' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'Wedding' })
  @IsString()
  eventType!: string;

  @ApiProperty({ example: '2026-12-15' })
  @IsDateString()
  preferredEventDate!: string;

  @ApiProperty({ example: 250 })
  @Type(() => Number)
  @IsInt()
  expectedGuestCount!: number;

  @ApiProperty({ type: BudgetRangeDto })
  @ValidateNested()
  @Type(() => BudgetRangeDto)
  budgetRange!: BudgetRangeDto;

  @ApiProperty({ example: ['Venue', 'Catering', 'Photography'] })
  @IsArray()
  @IsString({ each: true })
  servicesNeeded!: string[];

  @ApiPropertyOptional({ example: 'Looking for a modern indoor venue.' })
  @IsOptional()
  @IsString()
  additionalDetails?: string;
}
