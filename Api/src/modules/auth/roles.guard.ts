import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from './auth.guard';
import { ROLES_KEY } from './roles.decorator';
import { VENDOR_ONBOARDING_BYPASS_KEY } from './vendor-onboarding.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user || !roles.includes(request.user.role)) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    const onboardingBypass = this.reflector.getAllAndOverride<boolean>(VENDOR_ONBOARDING_BYPASS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (
      request.user.role === UserRole.VENDOR &&
      request.user.updatedProfile !== true &&
      !onboardingBypass
    ) {
      throw new ForbiddenException('Please complete your vendor profile before using the panel');
    }
    return true;
  }
}
