import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
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
 * Almacén de usuarios con triple respaldo:
 * 1. Redis (`gateway:user:<email>`)
 * 2. Archivo persistente en disco (`data/users.json`) para sobrevivir reinicios de PM2/Redis
 * 3. Mapa en memoria (`this.memory`) para acceso inmediato
 */
@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private readonly memory = new Map<string, User>();
  private readonly storePath = path.resolve(process.cwd(), 'data', 'users.json');

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  private loadFromDisk(): void {
    try {
      if (!fs.existsSync(this.storePath)) return;
      const raw = fs.readFileSync(this.storePath, 'utf8');
      const parsed = JSON.parse(raw) as User[];
      if (Array.isArray(parsed)) {
        for (const u of parsed) {
          if (u?.email && u?.password) {
            this.memory.set(u.email.trim().toLowerCase(), {
              ...u,
              email: u.email.trim().toLowerCase(),
            });
          }
        }
      }
    } catch (e) {
      this.logger.warn(`No se pudo leer data/users.json: ${(e as Error).message}`);
    }
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.memory.values());
      fs.writeFileSync(this.storePath, JSON.stringify(list, null, 2), 'utf8');
    } catch (e) {
      this.logger.warn(`No se pudo guardar data/users.json: ${(e as Error).message}`);
    }
  }

  async onModuleInit(): Promise<void> {
    // 1. Cargar primero los usuarios/contraseñas persistidos en disco
    this.loadFromDisk();

    // 2. Sincronizar los usuarios de disco hacia Redis (por si Redis se reinició)
    for (const [email, user] of this.memory.entries()) {
      await this.redis
        .getClient()
        ?.set(`${USER_PREFIX}${email}`, JSON.stringify(user))
        .catch(() => undefined);
    }

    // 3. Cargar SEED_USERS solo si el usuario aún NO existe en Redis ni en disco
    const seeds = (this.config.get<string>('SEED_USERS') ?? '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const [i, seed] of seeds.entries()) {
      const [rawEmail, password, role] = seed.split(':');
      if (!rawEmail || !password) continue;
      const email = rawEmail.trim().toLowerCase();

      const existingInRedis = await this.redis
        .getClient()
        ?.get(`${USER_PREFIX}${email}`)
        .catch(() => null);

      if (existingInRedis) {
        try {
          this.memory.set(email, JSON.parse(existingInRedis) as User);
          continue;
        } catch {
          // continuar si el JSON estaba corrupto
        }
      }

      if (this.memory.has(email)) {
        await this.redis
          .getClient()
          ?.set(`${USER_PREFIX}${email}`, JSON.stringify(this.memory.get(email)))
          .catch(() => undefined);
        continue;
      }

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
    this.saveToDisk();
    this.logger.log(`${this.memory.size} usuarios activos en almacén (seed + personalizados)`);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const key = email.trim().toLowerCase();
    const cached = await this.redis
      .getClient()
      ?.get(`${USER_PREFIX}${key}`)
      .catch(() => null);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as User;
        this.memory.set(key, parsed);
        return parsed;
      } catch {
        // ignore parse error
      }
    }
    return this.memory.get(key);
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const key = user.email.trim().toLowerCase();
    const created: User = { ...user, email: key, id: `usr-${Date.now()}` };
    this.memory.set(key, created);
    this.saveToDisk();
    await this.redis
      .getClient()
      ?.set(`${USER_PREFIX}${key}`, JSON.stringify(created))
      .catch(() => undefined);
    return created;
  }

  async update(user: User, previousEmail?: string): Promise<void> {
    const key = user.email.trim().toLowerCase();
    const updated: User = { ...user, email: key };
    if (previousEmail) {
      const oldKey = previousEmail.trim().toLowerCase();
      if (oldKey !== key) {
        this.memory.delete(oldKey);
        await this.redis
          .getClient()
          ?.del(`${USER_PREFIX}${oldKey}`)
          .catch(() => undefined);
      }
    }
    this.memory.set(key, updated);
    this.saveToDisk();
    await this.redis
      .getClient()
      ?.set(`${USER_PREFIX}${key}`, JSON.stringify(updated))
      .catch(() => undefined);
  }
}
