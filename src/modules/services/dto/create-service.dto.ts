import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
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

  @ApiProperty({ example: 'Premium wedding stage, floral entry, lighting, and table decor.' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'Dubai' })
  @IsString()
  city!: string;

  @ApiProperty({ type: MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  price!: MoneyDto;
}
