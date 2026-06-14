import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpsertAvailabilityDto {
  @ApiProperty({ example: 'ven_luxe_events', required: false, description: 'Required for administrators; ignored for vendors.' })
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: ['AVAILABLE', 'BLOCKED', 'OFFLINE_BOOKING'], example: 'AVAILABLE' })
  @IsIn(['AVAILABLE', 'BLOCKED', 'OFFLINE_BOOKING'])
  status!: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(0)
  capacity!: number;

  @ApiProperty({ example: 'Open for online bookings', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
