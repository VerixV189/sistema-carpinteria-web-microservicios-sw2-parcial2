import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './auth.service';

/** Verifica JWTs para los middlewares de proxy (fuera del pipeline Nest). */
@Injectable()
export class JwtVerifyService {
  constructor(private readonly jwt: JwtService) {}

  verify(authHeader?: string): JwtPayload | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
      return this.jwt.verify<JwtPayload>(authHeader.slice(7));
    } catch {
      return null;
    }
  }
}
