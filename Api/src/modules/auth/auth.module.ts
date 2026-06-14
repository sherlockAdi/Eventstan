import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { OptionalAuthGuard } from './optional-auth.guard';
import { PasswordService } from './password.service';
import { RolesGuard } from './roles.guard';
import { TokenService } from './token.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService, AuthGuard, OptionalAuthGuard, RolesGuard],
  exports: [AuthService, PasswordService, TokenService, AuthGuard, OptionalAuthGuard, RolesGuard],
})
export class AuthModule {}
