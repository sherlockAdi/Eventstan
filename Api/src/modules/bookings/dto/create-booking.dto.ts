import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'usr_customer', required: false, description: 'Set from the authenticated customer.' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ example: 'EVENT10', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ example: 'Downtown Dubai, UAE' })
  @IsString()
  eventAddress!: string;

  @ApiProperty({ example: 'Wedding event for 250 guests', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
