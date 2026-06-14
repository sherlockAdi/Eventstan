import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDateString, IsEmail, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({ example: 'TemporaryPassword123!', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

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

  @ApiProperty({ example: 'Premium wedding planning professional in Dubai.', required: false })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({ example: 'Aisha', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Khan', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'aisha-events', required: false })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({ example: 'aisha@example.com', required: false })
  @IsOptional()
  @IsEmail()
  primaryEmail?: string;

  @ApiProperty({ example: '+97142220000', required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ example: '501234567', required: false })
  @IsOptional()
  @IsString()
  primaryMobile?: string;

  @ApiProperty({ example: 'Wedding Planner', required: false })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiProperty({ example: 'Dubai', required: false })
  @IsOptional()
  @IsString()
  businessLocation?: string;

  @ApiProperty({ example: 'UAE Work Visa', required: false })
  @IsOptional()
  @IsString()
  visaType?: string;

  @ApiProperty({ example: 'Business Bay, Dubai', required: false })
  @IsOptional()
  @IsString()
  address?: string;

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

  @ApiProperty({ example: 'Professional annual plan', required: false })
  @IsOptional()
  @IsString()
  planDetails?: string;

  @ApiProperty({ example: '2027-06-30', required: false })
  @IsOptional()
  @IsDateString()
  planExpiry?: string;

  @ApiProperty({ example: 'https://minio.eventstan.com/eventstan/agreements/file.pdf', required: false })
  @IsOptional()
  @IsString()
  agreementFileUrl?: string;

  @ApiProperty({ example: 'agreements/2026-06-05/file.pdf', required: false })
  @IsOptional()
  @IsString()
  agreementFileKey?: string;

  @ApiProperty({ example: 'Emirates NBD', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ example: 'Aisha Khan', required: false })
  @IsOptional()
  @IsString()
  accountFullName?: string;

  @ApiProperty({ example: 'AE070331234567890123456', required: false })
  @IsOptional()
  @IsString()
  ibanNo?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({ example: 'EBILAEAD', required: false })
  @IsOptional()
  @IsString()
  swift?: string;

  @ApiProperty({ example: 'Downtown Dubai Branch', required: false })
  @IsOptional()
  @IsString()
  branchAddress?: string;
}
