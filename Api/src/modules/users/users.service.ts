import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { PasswordService } from '../auth/password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  list(role?: string, active?: boolean, search?: string) {
    return this.prisma.user.findMany({
      where: {
        ...(role ? { role: role as never } : {}),
        ...(active !== undefined ? { isActive: active } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: this.publicSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { ...this.publicSelect, vendor: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Email is already registered');
    }
    return this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        phone: dto.phone?.trim() || null,
        role: dto.role,
        passwordHash: await this.passwords.hash(dto.password),
      },
      select: this.publicSelect,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.get(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.email !== undefined ? { email: dto.email.trim().toLowerCase() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      select: this.publicSelect,
    });
  }

  async delete(id: string) {
    await this.get(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: this.publicSelect,
    });
  }

  private readonly publicSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  } as const;
}
