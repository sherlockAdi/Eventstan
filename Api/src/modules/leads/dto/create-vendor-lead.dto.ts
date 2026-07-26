import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateVendorLeadDto {
  @ApiProperty({ example: 'Elegant Events' })
  @IsString()
  @MinLength(2)
  businessName!: string;

  @ApiProperty({ example: 'Aisha Khan' })
  @IsString()
  @MinLength(2)
  yourName!: string;

  @ApiProperty({ example: 'aisha.khan@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+971501234567' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: ['https://elegantevents.com', 'https://instagram.com/elegantevents'] })
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
}
