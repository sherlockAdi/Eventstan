import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'user_id_here' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'package_id_here' })
  @IsString()
  packageId!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}
