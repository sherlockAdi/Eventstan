import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BudgetRangeDto } from './budget-range.dto';

export class UpdateUserLeadDto {
  @ApiPropertyOptional({ example: 'Aisha Khan' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'aisha.khan@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+971501234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Wedding' })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({ example: '2026-12-15' })
  @IsOptional()
  @IsDateString()
  preferredEventDate?: string;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  expectedGuestCount?: number;

  @ApiPropertyOptional({ type: BudgetRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BudgetRangeDto)
  budgetRange?: BudgetRangeDto;

  @ApiPropertyOptional({ example: ['Venue', 'Catering'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  servicesNeeded?: string[];

  @ApiPropertyOptional({ example: 'Looking for a modern indoor venue.' })
  @IsOptional()
  @IsString()
  additionalDetails?: string;

  @ApiPropertyOptional({ example: 'NEW' })
  @IsOptional()
  @IsString()
  status?: string;
}
