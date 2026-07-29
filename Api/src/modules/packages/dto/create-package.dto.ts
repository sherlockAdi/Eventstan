import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PromotionDiscountType } from '@prisma/client';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { MoneyDto } from '../../../common/dto/money.dto';

export class CreatePackageDto {
  @ApiProperty({ example: 'ven_luxe_events' })
  @IsString()
  vendorId!: string;

  @ApiProperty({ example: 'Gold Wedding Package' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'cat_venue', description: 'Required when the package is not linked to a service.' })
  @IsOptional()
  @IsString()
  categoryId?: string;

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

  @ApiPropertyOptional({ example: false, description: 'Show this package on the promotional homepage section.' })
  @IsOptional()
  @IsBoolean()
  showOnPromotionalPage?: boolean;

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

  @ApiPropertyOptional({ example: 'https://example.com/package.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: '+971501234567' })
  @IsOptional()
  @IsString()
  vendorPhone?: string;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  maxGuests?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  minDays?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  maxDays?: number;

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

  @ApiPropertyOptional({ example: 2 })
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

  @ApiPropertyOptional({ example: '2026-07-09T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  promotionStartDate?: string;

  @ApiPropertyOptional({ example: '2026-07-20T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  promotionEndDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isRental?: boolean;

  @ApiPropertyOptional({ example: 'Downtown Dubai, UAE' })
  @IsOptional()
  @IsString()
  rentalLocation?: string;

  @ApiPropertyOptional({ example: 'loc_001' })
  @IsOptional()
  @IsString()
  rentalLocationId?: string;

  @ApiPropertyOptional({ example: 'Dubai Marina, JBR, Downtown' })
  @IsOptional()
  @IsString()
  serviceArea?: string;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  deliveryRadius?: number;

  @ApiPropertyOptional({ example: 'base' })
  @IsOptional()
  @IsString()
  deliveryFeeType?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  pickupAvailable?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  deliveryAvailable?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  requiresDeposit?: boolean;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;
}
