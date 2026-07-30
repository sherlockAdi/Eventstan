import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreateVendorDto } from './create-vendor.dto';

export class VendorResponseDto extends OmitType(CreateVendorDto, [
  'password',
  'tradeLicenseFile',
  'passportFile',
  'agreementFile',
] as const) {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  userId?: string | null;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  updatedProfile?: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
