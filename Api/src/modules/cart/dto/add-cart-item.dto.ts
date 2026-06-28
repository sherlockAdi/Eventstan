import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: 'usr_customer', required: false, description: 'Set from the authenticated customer.' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ enum: ['PACKAGE'], example: 'PACKAGE' })
  @IsIn(['PACKAGE'])
  type!: 'PACKAGE';

  @ApiProperty({ example: 'svc_decoration' })
  @IsString()
  itemId!: string;

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  eventDate!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}
