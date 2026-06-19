import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateSupportTicketStatusDto {
  @ApiProperty({ enum: ['OPEN', 'WAITING_FOR_ADMIN', 'WAITING_FOR_VENDOR', 'RESOLVED', 'CLOSED'] })
  @IsString()
  @IsIn(['OPEN', 'WAITING_FOR_ADMIN', 'WAITING_FOR_VENDOR', 'RESOLVED', 'CLOSED'])
  status!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
