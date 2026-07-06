import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PromotionDiscountType } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { MoneyDto } from '../../../common/dto/money.dto';

export class CreatePackageDto {
  @ApiProperty({ example: 'ven_luxe_events' })
  @IsString()
  vendorId!: string;

  @ApiProperty({ example: 'Gold Wedding Package' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Decoration, photography, and catering coordination.' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: 'svc_decoration', description: 'Optional linked service for the package.' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ example: ['svc_decoration'], deprecated: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  itemIds?: string[];

  @ApiProperty({ example: 1800, description: 'Exact fixed package price.' })
  @IsNumber()
  exactPrice!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;

  @ApiPropertyOptional({ example: 'per_event' })
  @IsOptional()
  @IsString()
  priceUnit?: string;

  @ApiPropertyOptional({ type: MoneyDto, deprecated: true, description: 'Legacy field. Use exactPrice and currency instead.' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  price?: MoneyDto;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  showOnHomepage?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['Setup included', 'Custom floral arrangements'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedItems?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Indoor', 'Premium decor'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  maxGuests?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  minHours?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  maxHours?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  minPersons?: number;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsNumber()
  maxPersons?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  minPieces?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  maxPieces?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPromotional?: boolean;

  @ApiPropertyOptional({ enum: PromotionDiscountType, example: PromotionDiscountType.PERCENTAGE })
  @IsOptional()
  @IsEnum(PromotionDiscountType)
  promotionDiscountType?: PromotionDiscountType;

  @ApiPropertyOptional({ example: 20, description: 'Flat amount or percentage discount depending on promotionDiscountType.' })
  @IsOptional()
  @IsNumber()
  promotionDiscountValue?: number;
}
