import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateVendorLeadDto {
  @ApiPropertyOptional({ example: 'Elegant Events' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ example: 'Aisha Khan' })
  @IsOptional()
  @IsString()
  yourName?: string;

  @ApiPropertyOptional({ example: 'aisha.khan@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+971501234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: ['https://elegantevents.com'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  websiteSocialMedia?: string[];

  @ApiPropertyOptional({ example: 'cmqwka2330007iy88a1fjpgof' })
  @IsOptional()
  @IsString()
  serviceCategoryId?: string;

  @ApiPropertyOptional({ example: 'cmr8xk9ab0012xyz789abcde' })
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: 'We provide premium event planning services.' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: 'NEW' })
  @IsOptional()
  @IsString()
  status?: string;
}
