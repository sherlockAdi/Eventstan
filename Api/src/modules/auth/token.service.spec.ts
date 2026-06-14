import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { TokenService } from './token.service';

describe('TokenService', () => {
  const config = new ConfigService({
    JWT_SECRET: 'test-secret-that-is-longer-than-thirty-two-characters',
    JWT_EXPIRES_IN_SECONDS: '3600',
  });
  const tokens = new TokenService(config);

  it('issues and verifies signed tokens', () => {
    const session = tokens.issue({
      id: 'user_1',
      email: 'user@example.com',
      role: UserRole.CUSTOMER,
    });
    const payload = tokens.verify(session.accessToken);

    expect(payload.sub).toBe('user_1');
    expect(payload.email).toBe('user@example.com');
    expect(payload.role).toBe(UserRole.CUSTOMER);
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it('rejects a modified token', () => {
    const session = tokens.issue({
      id: 'user_1',
      email: 'user@example.com',
      role: UserRole.CUSTOMER,
    });
    expect(() => tokens.verify(`${session.accessToken}changed`)).toThrow('Invalid access token');
  });
});
