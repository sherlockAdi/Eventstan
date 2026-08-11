import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemoveCartItemDto {
  @ApiProperty({ example: 'user_id_here' })
  @IsString()
  userId!: string;
}
