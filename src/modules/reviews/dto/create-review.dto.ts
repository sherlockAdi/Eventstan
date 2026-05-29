import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'bkg_123' })
  @IsString()
  bookingId!: string;

  @ApiProperty({ example: 'ven_luxe_events' })
  @IsString()
  vendorId!: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: 'Excellent decoration and smooth coordination.' })
  @IsString()
  comment!: string;
}
