import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let auth: AuthService;

  const usersMock = {
    findByEmail: jest.fn(async (email: string) =>
      email === 'admin@carpinteria.com'
        ? { id: 'usr-1', email, name: 'admin', password: 'admin123', role: 'ADMIN' as const }
        : undefined,
    ),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersMock },
        { provide: JwtService, useValue: new JwtService({ secret: 'test' }) },
      ],
    }).compile();
    auth = module.get(AuthService);
  });

  it('login exitoso devuelve accessToken y usuario', async () => {
    const res = await auth.login('admin@carpinteria.com', 'admin123');
    expect(res.accessToken).toBeDefined();
    expect(res.user.role).toBe('ADMIN');
  });

  it('login con password incorrecta lanza Unauthorized', async () => {
    await expect(auth.login('admin@carpinteria.com', 'mala')).rejects.toThrow(UnauthorizedException);
  });
});
