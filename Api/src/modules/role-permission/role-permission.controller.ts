import { Body, Controller, Get, Param, Patch, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RolePermissionService } from './role-permission.service';
import { UpsertRolePermissionDto } from './dto/upsert-role-permission.dto';

@ApiTags('role-permission')
@Controller('role-permission')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class RolePermissionController {
  constructor(private readonly rolePermissions: RolePermissionService) {}

  @Get('definitions')
  @ApiOkResponse({ description: 'Returns the permission module definitions.' })
  definitions() {
    return this.rolePermissions.listDefinitions();
  }

  @Get()
  @ApiOkResponse({ description: 'Returns all role permission records.' })
  list() {
    return this.rolePermissions.list();
  }

  @Get(':role')
  @ApiOkResponse({ description: 'Returns a single role permission record.' })
  get(@Param('role') role: string) {
    return this.rolePermissions.get(role);
  }

  @Put(':role')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('role') role: string,
    @Body() dto: UpsertRolePermissionDto,
  ) {
    return this.rolePermissions.upsert(role, dto, request.user.id);
  }

  @Patch(':role')
  updatePartial(
    @Req() request: AuthenticatedRequest,
    @Param('role') role: string,
    @Body() dto: UpsertRolePermissionDto,
  ) {
    return this.rolePermissions.upsert(role, dto, request.user.id);
  }
}
