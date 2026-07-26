import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ListingStatus } from '@prisma/client';
import { MoneyDto } from '../../../common/dto/money.dto';

export class CreateServiceDto {
  @ApiProperty({ example: 'ven_luxe_events' })
  @IsString()
  vendorId!: string;

  @ApiProperty({ example: 'cat_wedding' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ example: 'Luxury Wedding Decoration' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'luxury-wedding-decoration' })
  @IsString()
  slug!: string;

  @ApiProperty({ example: 'Premium wedding stage, floral entry, lighting, and table decor.' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'Dubai' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 800, description: 'Minimum starting price for this service range.' })
  @IsNumber()
  priceMin!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ example: 5000, required: false, description: 'Maximum price for this service range.' })
  @IsOptional()
  @IsNumber()
  priceMax?: number;

  @ApiPropertyOptional({ type: MoneyDto, deprecated: true, description: 'Legacy field. Use priceMin and currency instead.' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  price?: MoneyDto;

  @ApiProperty({ example: 'per event', required: false })
  @IsOptional()
  @IsString()
  priceUnit?: string;

  @ApiProperty({ example: 'https://example.com/service.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: false, description: 'Show this service on the promotional homepage section.' })
  @IsOptional()
  @IsBoolean()
  showOnPromotionalPage?: boolean;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ example: true, description: 'Show this service on the homepage carousel/featured area.' })
  @IsOptional()
  @IsBoolean()
  showOnHomepage?: boolean;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}
