import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ enum: ['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP'] })
  @IsIn(['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP'])
  channel!: string;

  @ApiProperty({ example: 'BOOKING_CONFIRMED' })
  @IsString()
  event!: string;

  @ApiProperty({ example: 'customer@example.com' })
  @IsString()
  recipient!: string;

  @ApiProperty({ example: { title: 'Booking confirmed', message: 'Your booking is confirmed.' } })
  @IsObject()
  payload!: Record<string, unknown>;
}
