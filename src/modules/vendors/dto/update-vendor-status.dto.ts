import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateVendorStatusDto {
  @ApiProperty({ enum: ['PENDING_VERIFICATION', 'APPROVED', 'SUSPENDED', 'REJECTED'], example: 'APPROVED' })
  @IsIn(['PENDING_VERIFICATION', 'APPROVED', 'SUSPENDED', 'REJECTED'])
  status!: string;

  @ApiProperty({ example: 'Trade license verified by admin.', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
