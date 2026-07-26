import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class ListBlogsQuery {
  @ApiPropertyOptional({ example: 'true', description: 'Include unpublished posts for admin users.' })
  @IsOptional()
  @IsBooleanString()
  includeAll?: string;

  @ApiPropertyOptional({ example: 'published' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Venues' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsBooleanString()
  featured?: string;

  @ApiPropertyOptional({ example: 'wedding' })
  @IsOptional()
  @IsString()
  search?: string;
}
