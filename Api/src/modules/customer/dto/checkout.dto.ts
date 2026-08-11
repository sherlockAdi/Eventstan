import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: 'user_id_here' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: ['cart_item_id_1', 'cart_item_id_2'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  cartItemIds!: string[];

  @ApiProperty({ example: '2026-09-04' })
  @IsDateString()
  eventDate!: string;

  @ApiProperty({ example: 'Wedding' })
  @IsString()
  eventType!: string;

  @ApiProperty({ example: 500, minimum: 1 })
  @IsInt()
  @Min(1)
  guestCount!: number;

  @ApiProperty({ example: 'Need premium decoration.', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ example: 'pay_on_confirmation' })
  @IsString()
  paymentMethod!: string;
}
