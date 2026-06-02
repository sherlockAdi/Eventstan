import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty({ enum: ['CUSTOMER', 'VENDOR', 'ADMIN'], example: 'CUSTOMER' })
  @IsIn(['CUSTOMER', 'VENDOR', 'ADMIN'])
  cancelledBy!: string;

  @ApiProperty({ example: 'Customer changed event date.', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
