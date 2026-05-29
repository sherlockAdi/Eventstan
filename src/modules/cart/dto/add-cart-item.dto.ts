import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsString, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: 'usr_customer' })
  @IsString()
  customerId!: string;

  @ApiProperty({ enum: ['SERVICE', 'PACKAGE'], example: 'SERVICE' })
  @IsIn(['SERVICE', 'PACKAGE'])
  type!: 'SERVICE' | 'PACKAGE';

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
