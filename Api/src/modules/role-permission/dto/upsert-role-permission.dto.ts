import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionAction, PermissionModuleState } from '../role-permission.constants';
import { UserRole } from '@prisma/client';

class PermissionModuleDto implements PermissionModuleState {
  @ApiProperty()
  @IsString()
  key!: string;

  @ApiProperty()
  @IsString()
  label!: string;

  @ApiProperty({ enum: ['ADMIN', 'VENDOR', 'CUSTOMER'] })
  @IsIn(['ADMIN', 'VENDOR', 'CUSTOMER'])
  panel!: 'ADMIN' | 'VENDOR' | 'CUSTOMER';

  @ApiProperty({ type: [String] })
  @IsArray()
  routes!: string[];

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  actions!: PermissionAction[];

  @ApiProperty()
  @IsBoolean()
  view!: boolean;

  @ApiProperty()
  @IsBoolean()
  create!: boolean;

  @ApiProperty()
  @IsBoolean()
  edit!: boolean;

  @ApiProperty()
  @IsBoolean()
  delete!: boolean;
}

export class UpsertRolePermissionDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [PermissionModuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionModuleDto)
  permissions!: PermissionModuleDto[];
}

export class RolePermissionRoleParamDto {
  @ApiProperty({ enum: UserRole })
  @IsString()
  role!: string;
}
