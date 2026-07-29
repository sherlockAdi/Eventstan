import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

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

  @ApiProperty({ example: '+971', required: false })
  @IsOptional()
  @IsString()
  countryCode?: string;

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

  @ApiProperty({ example: 'FREELANCER', required: false, enum: ['FREELANCER', 'PERMANENT'] })
  @IsOptional()
  @IsIn(['FREELANCER', 'PERMANENT'])
  vendorType?: string;

  @ApiProperty({ example: 'hourly', required: false, enum: ['hourly', 'monthly', 'project'] })
  @IsOptional()
  @IsIn(['hourly', 'monthly', 'project'])
  contractType?: string;

  @ApiProperty({ example: 120, required: false })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiProperty({ example: 40, required: false })
  @IsOptional()
  @IsInt()
  availableHoursPerWeek?: number;

  @ApiProperty({ example: 2500, required: false })
  @IsOptional()
  @IsNumber()
  projectRate?: number;

  @ApiProperty({ example: 'monthly', required: false, enum: ['monthly', 'yearly'] })
  @IsOptional()
  @IsIn(['monthly', 'yearly'])
  salaryType?: string;

  @ApiProperty({ example: 12000, required: false })
  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @ApiProperty({ example: 2000, required: false })
  @IsOptional()
  @IsNumber()
  housingAllowance?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  transportationAllowance?: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  otherAllowances?: number;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsInt()
  annualLeaves?: number;

  @ApiProperty({ example: 48, required: false })
  @IsOptional()
  @IsInt()
  workingHours?: number;

  @ApiProperty({ example: '2026-08-01', required: false })
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiProperty({ example: 'EVT2026', required: false })
  @IsOptional()
  @IsString()
  inviteCode?: string;

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

  @ApiProperty({
    example: 'https://api.eventstan.com/api/v1/uploads/images/services/2026-06-29/00f51b35-8817-4597-9ecf-6e4d60feb643.webp',
    required: false,
  })
  @IsOptional()
  @IsString()
  vendorProfileImage?: string;

  @ApiPropertyOptional({ example: 'DXB-TL-10001' })
  @IsOptional()
  @IsString()
  tradeLicenseNumber?: string;

  @ApiPropertyOptional({ example: '2027-06-30' })
  @IsOptional()
  @IsDateString()
  tradeLicenseExpiry?: string;

  @ApiPropertyOptional({ example: 'https://minio.eventstan.com/eventstan/vendor-docs/trade-license.pdf' })
  @IsOptional()
  @IsString()
  tradeLicenseFileUrl?: string;

  @ApiPropertyOptional({ example: 'vendor-docs/2026-07-11/trade-license.pdf' })
  @IsOptional()
  @IsString()
  tradeLicenseFileKey?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  tradeLicenseFile?: unknown;

  @ApiPropertyOptional({ example: '2028-01-15' })
  @IsOptional()
  @IsDateString()
  passportExpiry?: string;

  @ApiPropertyOptional({ example: 'https://minio.eventstan.com/eventstan/vendor-docs/passport.pdf' })
  @IsOptional()
  @IsString()
  passportFileUrl?: string;

  @ApiPropertyOptional({ example: 'vendor-docs/2026-07-11/passport.pdf' })
  @IsOptional()
  @IsString()
  passportFileKey?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  passportFile?: unknown;

  @ApiPropertyOptional({ example: '2027-12-31' })
  @IsOptional()
  @IsDateString()
  emiratesIdExpiry?: string;

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

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  agreementFile?: unknown;

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
