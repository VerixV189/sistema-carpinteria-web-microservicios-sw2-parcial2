import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService, User } from './users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: User['role'];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private tokenFor(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    let user = (await this.users.findByEmail(cleanEmail)) ?? (await this.users.findByEmail(email.trim()));
    let ok = false;
    if (user) {
      if (user.password.startsWith('$2')) {
        ok = await bcrypt.compare(password, user.password);
      } else {
        // Registro legado en claro → migra a bcrypt al primer login exitoso.
        ok = user.password === password;
        if (ok) {
          user.password = bcrypt.hashSync(password, 10);
          await this.users.update(user);
        }
      }
    } else {
      // Si el carpintero o cliente fue registrado en PostgreSQL desde el Admin sin cuenta en Redis aún,
      // verificamos en business-service y aprovisionamos su usuario automáticamente.
      user = await this.tryProvisionFromBusinessService(cleanEmail, password);
      if (user) ok = true;
    }
    if (!user || !ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.tokenFor(user);
  }

  /**
   * Crea o actualiza la cuenta de acceso (contraseña y rol) de un Carpintero o Cliente
   * cuando el Administrador lo registra o edita desde el Panel Admin.
   */
  async upsertUserAccount(dto: { email: string; name: string; password?: string; role?: User['role'] }) {
    const email = dto.email.trim().toLowerCase();
    const role: User['role'] = dto.role ?? 'CARPENTER';
    const rawPw = dto.password?.trim() || (role === 'CARPENTER' ? 'carp123' : 'cliente123');
    const existing = await this.users.findByEmail(email);

    if (existing) {
      existing.name = dto.name.trim() || existing.name;
      existing.role = role;
      if (dto.password?.trim()) {
        existing.password = bcrypt.hashSync(dto.password.trim(), 10);
      }
      await this.users.update(existing);
      return { id: existing.id, email: existing.email, name: existing.name, role: existing.role, updated: true };
    }

    const created = await this.users.create({
      email,
      name: dto.name.trim() || email.split('@')[0],
      password: bcrypt.hashSync(rawPw, 10),
      role,
    });
    return { id: created.id, email: created.email, name: created.name, role: created.role, created: true };
  }

  private async tryProvisionFromBusinessService(email: string, password: string): Promise<User | undefined> {
    const base = this.config.get<string>('BUSINESS_SERVICE_URL');
    const secret = this.config.get<string>('INTERNAL_SECRET');
    if (!base) return undefined;
    try {
      const res = await fetch(`${base}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret ?? '' },
        body: JSON.stringify({
          query: '{ carpenters { id name email active } clients { id name email } }',
        }),
      });
      const body = (await res.json()) as {
        data?: {
          carpenters?: { id: string; name: string; email: string; active: boolean }[];
          clients?: { id: string; name: string; email: string }[];
        };
      };
      const carp = (body.data?.carpenters ?? []).find((c) => c.email?.trim().toLowerCase() === email);
      if (carp && (password === 'carp123' || password === '123456')) {
        return await this.users.create({
          email,
          name: carp.name || email.split('@')[0],
          password: bcrypt.hashSync(password, 10),
          role: 'CARPENTER',
        });
      }
      const cli = (body.data?.clients ?? []).find((c) => c.email?.trim().toLowerCase() === email);
      if (cli && (password === 'cliente123' || password === '123456')) {
        return await this.users.create({
          email,
          name: cli.name || email.split('@')[0],
          password: bcrypt.hashSync(password, 10),
          role: 'CLIENT',
        });
      }
    } catch (e) {
      this.logger.warn(`Auto-provision check failed: ${(e as Error).message}`);
    }
    return undefined;
  }

  /** Registro público: crea usuario CLIENT + ficha de cliente en el negocio. */
  async register(dto: { email: string; password: string; name: string; phone?: string; address?: string }) {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    const user = await this.users.create({
      email,
      name: dto.name.trim() || email.split('@')[0],
      password: bcrypt.hashSync(dto.password, 10),
      role: 'CLIENT',
    });
    // Ficha de cliente en business-service (mejor esfuerzo: no bloquea el alta)
    const base = this.config.get<string>('BUSINESS_SERVICE_URL');
    const secret = this.config.get<string>('INTERNAL_SECRET');
    try {
      const res = await fetch(`${base}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret ?? '' },
        body: JSON.stringify({
          query: 'mutation($i: CreateClientInput!){ createClient(input:$i){ id email } }',
          variables: { i: { name: user.name, email: user.email, phone: dto.phone ?? null, address: dto.address ?? null } },
        }),
      });
      const body = (await res.json()) as { errors?: { message: string }[] };
      if (body.errors?.length) this.logger.warn(`createClient: ${body.errors[0].message}`);
    } catch (e) {
      this.logger.warn(`createClient no disponible: ${(e as Error).message}`);
    }
    return this.tokenFor(user);
  }

  async me(payload: JwtPayload) {
    const user = await this.users.findByEmail(payload.email);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  /**
   * SSO Federado Externo (Google OAuth 2.0 / OpenID Connect):
   * Valida o aprovisiona automáticamente al usuario federado por Google y emite el JWT unificado del ecosistema.
   */
  async loginWithGoogleProfile(profile: { email: string; name: string; picture?: string }) {
    const email = profile.email.trim().toLowerCase();
    const displayName = profile.name?.trim() || email.split('@')[0];

    let user = await this.users.findByEmail(email);
    if (user) {
      if (displayName && (!user.name || user.name === email.split('@')[0])) {
        user.name = displayName;
        await this.users.update(user);
      }
      return this.tokenFor(user);
    }

    // Si aún no existe en Redis, consultamos en business-service si es Carpintero o Cliente registrado
    const base = this.config.get<string>('BUSINESS_SERVICE_URL');
    const secret = this.config.get<string>('INTERNAL_SECRET');
    let detectedRole: User['role'] = 'CLIENT';
    let alreadyInPostgres = false;

    if (base) {
      try {
        const res = await fetch(`${base}/graphql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret ?? '' },
          body: JSON.stringify({
            query: '{ carpenters { id name email active } clients { id name email } }',
          }),
        });
        const body = (await res.json()) as {
          data?: {
            carpenters?: { id: string; name: string; email: string; active: boolean }[];
            clients?: { id: string; name: string; email: string }[];
          };
        };
        const carp = (body.data?.carpenters ?? []).find((c) => c.email?.trim().toLowerCase() === email);
        if (carp) {
          detectedRole = 'CARPENTER';
          alreadyInPostgres = true;
        } else {
          const cli = (body.data?.clients ?? []).find((c) => c.email?.trim().toLowerCase() === email);
          if (cli) {
            detectedRole = 'CLIENT';
            alreadyInPostgres = true;
          }
        }
      } catch (e) {
        this.logger.warn(`Google SSO Postgres lookup failed: ${(e as Error).message}`);
      }
    }

    user = await this.users.create({
      email,
      name: displayName,
      password: bcrypt.hashSync(`google-sso-${Date.now()}`, 10),
      role: detectedRole,
    });

    // Si es un nuevo cliente federado por Google y no estaba en PostgreSQL, creamos su ficha en business-service
    if (detectedRole === 'CLIENT' && !alreadyInPostgres && base) {
      try {
        await fetch(`${base}/graphql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret ?? '' },
          body: JSON.stringify({
            query: 'mutation($i: CreateClientInput!){ createClient(input:$i){ id email } }',
            variables: { i: { name: user.name, email: user.email, phone: null, address: 'Registrado con Google SSO' } },
          }),
        });
      } catch (e) {
        this.logger.warn(`Google SSO createClient failed: ${(e as Error).message}`);
      }
    }

    return this.tokenFor(user);
  }
}
