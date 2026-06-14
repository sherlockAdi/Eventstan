import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const passwords = new PasswordService();

  it('hashes and verifies a password without storing plaintext', async () => {
    const hash = await passwords.hash('StrongPassword123!');

    expect(hash).toMatch(/^scrypt:/);
    expect(hash).not.toContain('StrongPassword123!');
    await expect(passwords.verify('StrongPassword123!', hash)).resolves.toBe(true);
    await expect(passwords.verify('WrongPassword123!', hash)).resolves.toBe(false);
  });
});
