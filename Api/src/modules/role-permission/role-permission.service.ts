import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  DEFAULT_ROLE_PERMISSION_SEEDS,
  clonePermissions,
  normalizePermissions,
  type PermissionModuleState,
} from './role-permission.constants';
import { UpsertRolePermissionDto } from './dto/upsert-role-permission.dto';

@Injectable()
export class RolePermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async listDefinitions() {
    return DEFAULT_ROLE_PERMISSION_SEEDS.map((seed) => ({
      role: seed.role,
      name: seed.name,
      description: seed.description,
      isActive: seed.isActive,
      permissions: clonePermissions(seed.role, seed.permissions),
    }));
  }

  async list() {
    const roleCounts = await Promise.all(
      DEFAULT_ROLE_PERMISSION_SEEDS.map(async (seed) => ({
        role: seed.role,
        usersCount: await this.prisma.user.count({ where: { role: seed.role } }),
      })),
    );
    const records = await this.prisma.rolePermission.findMany();
    const byRole = new Map(records.map((record) => [record.role, record]));

    return DEFAULT_ROLE_PERMISSION_SEEDS.map((seed) => {
      const record = byRole.get(seed.role);
      const permissions = normalizePermissions(seed.role, record?.permissions ?? seed.permissions);
      return {
        role: seed.role,
        name: record?.name ?? seed.name,
        description: record?.description ?? seed.description,
        usersCount: roleCounts.find((item) => item.role === seed.role)?.usersCount ?? 0,
        status: (record?.isActive ?? seed.isActive) ? 'Active' : 'Inactive',
        permissions,
      };
    });
  }

  async get(role: string) {
    const normalizedRole = this.ensureRole(role);
    const seed = DEFAULT_ROLE_PERMISSION_SEEDS.find((item) => item.role === normalizedRole);
    if (!seed) throw new NotFoundException('Role permission not found');

    const record = await this.prisma.rolePermission.findUnique({ where: { role: normalizedRole } });
    const permissions = normalizePermissions(normalizedRole, record?.permissions ?? seed.permissions);

    return {
      role: normalizedRole,
      name: record?.name ?? seed.name,
      description: record?.description ?? seed.description,
      status: (record?.isActive ?? seed.isActive) ? 'Active' : 'Inactive',
      permissions,
    };
  }

  async upsert(role: string, dto: UpsertRolePermissionDto, updatedByUserId?: string) {
    const normalizedRole = this.ensureRole(role);
    const seed = DEFAULT_ROLE_PERMISSION_SEEDS.find((item) => item.role === normalizedRole);
    if (!seed) throw new NotFoundException('Role permission not found');

    const permissions = normalizePermissions(normalizedRole, dto.permissions);

    return this.prisma.rolePermission.upsert({
      where: { role: normalizedRole },
      update: {
        name: dto.name.trim(),
        description: dto.description?.trim() || seed.description,
        isActive: dto.isActive ?? true,
        permissions: permissions as unknown as Prisma.InputJsonValue,
        updatedByUserId,
      },
      create: {
        role: normalizedRole,
        name: dto.name.trim(),
        description: dto.description?.trim() || seed.description,
        isActive: dto.isActive ?? true,
        permissions: permissions as unknown as Prisma.InputJsonValue,
        updatedByUserId,
      },
    });
  }

  async ensureDefaults() {
    for (const seed of DEFAULT_ROLE_PERMISSION_SEEDS) {
      await this.prisma.rolePermission.upsert({
        where: { role: seed.role },
        update: {
        name: seed.name,
        description: seed.description,
        isActive: seed.isActive,
        permissions: seed.permissions as unknown as Prisma.InputJsonValue,
      },
      create: {
        role: seed.role,
        name: seed.name,
        description: seed.description,
        isActive: seed.isActive,
        permissions: seed.permissions as unknown as Prisma.InputJsonValue,
      },
    });
  }
  }

  async getForRole(role: UserRole) {
    const seed = DEFAULT_ROLE_PERMISSION_SEEDS.find((item) => item.role === role);
    const record = await this.prisma.rolePermission.findUnique({ where: { role } });
    return normalizePermissions(role, record?.permissions ?? seed?.permissions ?? []);
  }

  private ensureRole(role: string) {
    const values = Object.values(UserRole) as string[];
    if (!values.includes(role)) {
      throw new NotFoundException('Role permission not found');
    }
    return role as UserRole;
  }
}
