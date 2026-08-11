import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class BookNowDto {
  @ApiProperty({ example: 'user_id_here' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'package_id_here' })
  @IsString()
  packageId!: string;

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

  @ApiProperty({ example: 'Need premium decoration and flower entrance.', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
