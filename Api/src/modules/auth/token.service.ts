import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { AuthTokenPayload, AuthenticatedUser } from './auth.types';

@Injectable()
export class TokenService {
  constructor(private readonly config: ConfigService) {}

  issue(user: AuthenticatedUser) {
    const now = Math.floor(Date.now() / 1000);
    const ttlSeconds = Number(this.config.get<string>('JWT_EXPIRES_IN_SECONDS', '86400'));
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + ttlSeconds,
    };

    const header = this.encode({ alg: 'HS256', typ: 'JWT' });
    const body = this.encode(payload);
    const unsignedToken = `${header}.${body}`;
    return {
      accessToken: `${unsignedToken}.${this.sign(unsignedToken)}`,
      tokenType: 'Bearer',
      expiresIn: ttlSeconds,
    };
  }

  verify(token: string): AuthTokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new UnauthorizedException('Invalid access token');

    const unsignedToken = `${parts[0]}.${parts[1]}`;
    const expected = Buffer.from(this.sign(unsignedToken));
    const actual = Buffer.from(parts[2]);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      throw new UnauthorizedException('Invalid access token');
    }

    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as AuthTokenPayload;
      if (!payload.sub || !payload.email || !payload.role || payload.exp <= Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('Access token expired');
      }
      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private encode(value: object) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private sign(value: string) {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }

  private get secret() {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must be configured with at least 32 characters');
    }
    return secret;
  }
}
