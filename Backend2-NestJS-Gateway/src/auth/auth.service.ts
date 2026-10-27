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
    const user = await this.users.findByEmail(email);
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
    }
    if (!user || !ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.tokenFor(user);
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
}
