import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
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
}
