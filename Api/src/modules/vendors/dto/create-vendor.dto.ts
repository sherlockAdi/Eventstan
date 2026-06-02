import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({ example: 'Luxe Events Dubai' })
  @IsString()
  companyName!: string;

  @ApiProperty({ example: 'Aisha Khan' })
  @IsString()
  contactPerson!: string;

  @ApiProperty({ example: 'vendor@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+971500000001' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'DXB-TL-10001' })
  @IsString()
  tradeLicenseNumber!: string;

  @ApiProperty({ example: '100000000000001', required: false })
  @IsOptional()
  @IsString()
  vatNumber?: string;

  @ApiProperty({ example: ['Dubai', 'Abu Dhabi'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  cities!: string[];

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  capacityPerDay!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  @Max(100)
  commissionPercent!: number;
}
