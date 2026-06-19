import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({ example: 'Need help updating my business profile' })
  @IsString()
  @MinLength(3)
  subject!: string;

  @ApiProperty({ example: 'My trade license upload is not saving.' })
  @IsString()
  @MinLength(5)
  message!: string;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/support/shot-1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
