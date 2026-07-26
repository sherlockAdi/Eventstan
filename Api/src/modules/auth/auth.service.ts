import { ConflictException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { MailService } from '../mail/mail.service';
import { RolePermissionService } from '../role-permission/role-permission.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly mail: MailService,
    private readonly rolePermissions: RolePermissionService,
  ) {}

  private get prismaClient() {
    return this.prisma as PrismaClient;
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        phone: dto.phone?.trim() || null,
        passwordHash: await this.passwords.hash(dto.password),
        role: UserRole.CUSTOMER,
      },
    });

    const session = await this.session(user);
    const welcomeEmailSent = await this.sendCustomerWelcome(user.name, user.email, dto.password);
    return { ...session, welcomeEmailSent };
  }

  private async sendCustomerWelcome(name: string, email: string, password: string) {
    try {
      const loginUrl = this.customerAppUrl('/auth/login');
      await this.mail.sendTemplate(
        'CUSTOMER_WELCOME',
        email,
        {
          name,
          email,
          password,
          login_url: loginUrl,
        },
        {
          subject: 'Welcome to EventStan, {{name}}',
          body: `
            <h2>Welcome to EventStan, {{name}}!</h2>
            <p>Your customer account is ready.</p>
            <p><strong>Login URL:</strong> <a href="{{login_url}}">{{login_url}}</a><br>
            <strong>Email:</strong> {{email}}<br>
            <strong>Password:</strong> {{password}}</p>
            <p>For security, please keep these credentials private.</p>
          `,
        },
      );
      return true;
    } catch {
      return false;
    }
  }

  async login(dto: LoginDto) {
    try {
      const email = dto.email.trim().toLowerCase();
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { vendor: true },
      });

      if (!user?.passwordHash || !(await this.passwords.verify(dto.password, user.passwordHash))) {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (!user.isActive) throw new UnauthorizedException('Account is inactive');

      return await this.session(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('denied access on the database') || message.includes('PrismaClientInitializationError')) {
        throw new ServiceUnavailableException(
          'Vendor login is temporarily unavailable because the configured database is rejecting connections from this environment.',
        );
      }
      throw error;
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash || !user.isActive) {
      return this.genericPasswordResetResponse();
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(token);
    const expiresInMinutes = Number(this.config.get<string>('PASSWORD_RESET_TTL_MINUTES', '60'));
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await this.prismaClient.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        OR: [{ usedAt: null }, { expiresAt: { lt: new Date() } }],
      },
    });

    await this.prismaClient.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = this.buildResetUrl(token);

    try {
      await this.mail.send({
        to: user.email,
        subject: 'Reset your EventStan password',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hello ${this.escapeHtml(user.name)},</p>
          <p>We received a request to reset your password. Use the link below to continue:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link expires in ${expiresInMinutes} minutes.</p>
          <p>If you did not request a reset, you can safely ignore this email.</p>
        `,
        text: [
          `Hello ${user.name},`,
          '',
          'We received a request to reset your password.',
          `Open this link to continue: ${resetUrl}`,
          '',
          `This link expires in ${expiresInMinutes} minutes.`,
          'If you did not request a reset, you can safely ignore this email.',
        ].join('\n'),
      });
    } catch (error) {
      await this.prismaClient.passwordResetToken.deleteMany({ where: { tokenHash } });
      throw new ServiceUnavailableException('Password reset email could not be sent');
    }

    return this.genericPasswordResetResponse();
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashResetToken(dto.token.trim());
    const record = await this.prismaClient.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date() || !record.user.isActive) {
      throw new UnauthorizedException('Reset token is invalid or has expired');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: await this.passwords.hash(dto.password) },
      }),
      this.prismaClient.passwordResetToken.update({
        where: { tokenHash },
        data: { usedAt: new Date() },
      }),
    ]);

    return { reset: true };
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vendor: true },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Account is unavailable');
    return await this.publicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
      },
      include: { vendor: true },
    });
    return await this.publicUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash || !(await this.passwords.verify(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await this.passwords.hash(dto.newPassword) },
    });
    return { changed: true };
  }

  private async session(user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    vendor?: { id: string; status: string; companyName: string; updatedProfile: boolean; vendorProfileImage: string | null; vendorType: string | null } | null;
  }) {
    return {
      ...this.tokens.issue({ id: user.id, email: user.email, role: user.role }),
      user: await this.publicUser(user),
    };
  }

  private async publicUser(user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    vendor?: { id: string; status: string; companyName: string; updatedProfile: boolean; vendorProfileImage: string | null; vendorType: string | null } | null;
  }) {
    const permissions = await this.rolePermissions.getForRole(user.role);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      vendorId: user.vendor?.id ?? null,
      vendorStatus: user.vendor?.status ?? null,
      companyName: user.vendor?.companyName ?? null,
      updatedProfile: user.vendor?.updatedProfile ?? null,
      vendorProfileImage: user.vendor?.vendorProfileImage ?? null,
      vendorType: user.vendor?.vendorType ?? null,
      permissions,
    };
  }

  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private customerAppUrl(path: string) {
    const baseUrl = this.config.get<string>('CUSTOMER_APP_URL', 'https://eventstan.com').replace(/\/$/, '');
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private buildResetUrl(token: string) {
    const configured = this.config.get<string>('PASSWORD_RESET_URL');
    if (configured) {
      if (configured.includes('{{token}}')) {
        return configured.replace('{{token}}', encodeURIComponent(token));
      }
      const separator = configured.includes('?') ? '&' : '?';
      return `${configured}${separator}token=${encodeURIComponent(token)}`;
    }

    const baseUrl = this.customerAppUrl('/auth/reset-password');
    return `${baseUrl}?token=${encodeURIComponent(token)}`;
  }

  private genericPasswordResetResponse() {
    return {
      message: 'If an account exists, password reset instructions have been sent.',
    };
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
