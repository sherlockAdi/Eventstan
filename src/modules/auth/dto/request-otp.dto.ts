import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '+971500000000' })
  @IsPhoneNumber()
  phone!: string;
}
