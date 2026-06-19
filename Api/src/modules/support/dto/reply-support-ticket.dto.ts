import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class ReplySupportTicketDto {
  @ApiPropertyOptional({ example: 'Thanks, I have attached the screenshot.' })
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/support/shot-2.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
