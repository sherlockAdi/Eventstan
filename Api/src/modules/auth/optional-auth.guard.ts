import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthenticatedUser } from './auth.types';
import { TokenService } from './token.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) return true;

    try {
      const payload = this.tokens.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, isActive: true, vendor: { select: { updatedProfile: true } } },
      });
      if (user?.isActive) {
        request.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          updatedProfile: user.vendor?.updatedProfile ?? undefined,
        };
      }
    } catch {
      request.user = undefined;
    }
    return true;
  }
}
