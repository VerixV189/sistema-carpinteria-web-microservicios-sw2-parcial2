import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RedisService } from '../cache/redis.service';

export type UserRole = 'ADMIN' | 'CLIENT' | 'CARPENTER';

export interface User {
  id: string;
  email: string;
  name: string;
  /** Hash bcrypt — nunca contraseña en claro. */
  password: string;
  role: UserRole;
}

const isHash = (pw: string) => pw.startsWith('$2');

const USER_PREFIX = 'gateway:user:';

/**
 * Almacén de usuarios.
 * - Seeds desde SEED_USERS (email:password:role;...) → Redis.
 * - Si Redis no está disponible, opera con un mapa en memoria (demo).
 */
@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private readonly memory = new Map<string, User>();

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit(): Promise<void> {
    const seeds = (this.config.get<string>('SEED_USERS') ?? '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const [i, seed] of seeds.entries()) {
      const [email, password, role] = seed.split(':');
      if (!email || !password) continue;
      const user: User = {
        id: `usr-${i + 1}`,
        email,
        name: email.split('@')[0],
        password: isHash(password) ? password : bcrypt.hashSync(password, 10),
        role: (role as UserRole) || 'CLIENT',
      };
      this.memory.set(email, user);
      await this.redis
        .getClient()
        ?.set(`${USER_PREFIX}${email}`, JSON.stringify(user))
        .catch(() => undefined);
    }
    this.logger.log(`${seeds.length} usuarios seed cargados`);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const cached = await this.redis
      .getClient()
      ?.get(`${USER_PREFIX}${email}`)
      .catch(() => null);
    if (cached) return JSON.parse(cached) as User;
    return this.memory.get(email);
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const created: User = { ...user, id: `usr-${Date.now()}` };
    this.memory.set(user.email, created);
    await this.redis
      .getClient()
      ?.set(`${USER_PREFIX}${user.email}`, JSON.stringify(created))
      .catch(() => undefined);
    return created;
  }

  async update(user: User): Promise<void> {
    this.memory.set(user.email, user);
    await this.redis
      .getClient()
      ?.set(`${USER_PREFIX}${user.email}`, JSON.stringify(user))
      .catch(() => undefined);
  }
}
