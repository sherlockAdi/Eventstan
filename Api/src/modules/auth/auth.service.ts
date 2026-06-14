import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly mail: MailService,
  ) {}

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

    const session = this.session(user);
    const welcomeEmailSent = await this.sendCustomerWelcome(user.name, user.email, dto.password);
    return { ...session, welcomeEmailSent };
  }

  private async sendCustomerWelcome(name: string, email: string, password: string) {
    try {
      await this.mail.sendTemplate(
        'CUSTOMER_WELCOME',
        email,
        {
          name,
          email,
          password,
          login_url: 'https://eventstan.com/auth/login',
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
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { vendor: true },
    });

    if (!user?.passwordHash || !(await this.passwords.verify(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.isActive) throw new UnauthorizedException('Account is inactive');

    return this.session(user);
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vendor: true },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Account is unavailable');
    return this.publicUser(user);
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
    return this.publicUser(user);
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

  private session(user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    vendor?: { id: string; status: string; companyName: string } | null;
  }) {
    return {
      ...this.tokens.issue({ id: user.id, email: user.email, role: user.role }),
      user: this.publicUser(user),
    };
  }

  private publicUser(user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    vendor?: { id: string; status: string; companyName: string } | null;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      vendorId: user.vendor?.id ?? null,
      vendorStatus: user.vendor?.status ?? null,
      companyName: user.vendor?.companyName ?? null,
    };
  }
}
