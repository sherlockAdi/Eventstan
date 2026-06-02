import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
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
}
