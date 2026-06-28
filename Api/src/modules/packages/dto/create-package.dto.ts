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

  @ApiProperty({ example: 'svc_decoration' })
  @IsString()
  serviceId!: string;

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

  @ApiPropertyOptional({ type: MoneyDto, deprecated: true, description: 'Legacy field. Use exactPrice and currency instead.' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  price?: MoneyDto;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  showOnHomepage?: boolean;

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
