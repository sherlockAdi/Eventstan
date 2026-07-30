import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiProperty()
  role!: string;

  @ApiPropertyOptional()
  vendorId?: string | null;

  @ApiPropertyOptional()
  vendorStatus?: string | null;

  @ApiPropertyOptional()
  companyName?: string | null;

  @ApiPropertyOptional()
  updatedProfile?: boolean | null;

  @ApiPropertyOptional()
  vendorProfileImage?: string | null;

  @ApiPropertyOptional()
  vendorType?: string | null;

  @ApiPropertyOptional()
  contractType?: string | null;

  @ApiPropertyOptional()
  hourlyRate?: number | null;

  @ApiPropertyOptional()
  availableHoursPerWeek?: number | null;

  @ApiPropertyOptional()
  projectRate?: number | null;

  @ApiPropertyOptional()
  salaryType?: string | null;

  @ApiPropertyOptional()
  basicSalary?: number | null;

  @ApiPropertyOptional()
  housingAllowance?: number | null;

  @ApiPropertyOptional()
  transportationAllowance?: number | null;

  @ApiPropertyOptional()
  otherAllowances?: number | null;

  @ApiPropertyOptional()
  annualLeaves?: number | null;

  @ApiPropertyOptional()
  workingHours?: number | null;

  @ApiPropertyOptional()
  joiningDate?: string | null;

  @ApiProperty({ type: [String] })
  permissions!: string[];
}
