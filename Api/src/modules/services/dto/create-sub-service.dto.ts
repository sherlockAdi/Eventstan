import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { MoneyDto } from '../../../common/dto/money.dto';

export class CreateSubServiceDto {
  @ApiProperty({ example: 'Premium Floral Entry' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Fresh flower arch, aisle markers, and entrance styling.' })
  @IsString()
  description!: string;

  @ApiProperty({ type: MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  price!: MoneyDto;

  @ApiProperty({ example: 'https://example.com/sub-service.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
