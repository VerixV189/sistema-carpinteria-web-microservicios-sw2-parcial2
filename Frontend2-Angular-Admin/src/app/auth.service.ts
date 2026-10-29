import { Injectable } from '@angular/core';

export interface Session {
  token: string;
  email: string;
  role: 'ADMIN' | 'CLIENT' | 'CARPENTER';
}

const KEY = 'carpinteria_session';
const HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const IS_HTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:';
const ROOT_DOMAIN = HOST.replace(/^(www|admin|taller|api)\./, '');
const GATEWAY_BASE = IS_HTTPS ? `https://api.${ROOT_DOMAIN}` : `http://${HOST}:3000`;
const LOGIN_URL = `${GATEWAY_BASE}/auth/login`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private decodeRole(token: string): Session['role'] {
    try {
      return JSON.parse(atob(token.split('.')[1])).role ?? 'CLIENT';
    } catch {
      return 'CLIENT';
    }
  }

  async login(email: string, password: string): Promise<Session> {
    const r = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error('Credenciales inválidas');
    const { accessToken } = await r.json();
    const session: Session = { token: accessToken, email, role: this.decodeRole(accessToken) };
    localStorage.setItem(KEY, JSON.stringify(session));
    return session;
  }

  session(): Session | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Session;
      const exp = JSON.parse(atob(s.token.split('.')[1])).exp;
      if (exp && exp * 1000 < Date.now()) {
        localStorage.removeItem(KEY);
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }

  /** Handoff desde el portal embebido: acepta ?token=&email= en la URL. */
  acceptHandoff(): void {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;
    const session: Session = {
      token,
      email: params.get('email') ?? '',
      role: this.decodeRole(token),
    };
    localStorage.setItem(KEY, JSON.stringify(session));
    params.delete('token');
    params.delete('email');
    const qs = params.toString();
    window.history.replaceState(
      {},
      '',
      window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash,
    );
  }

  token(): string | null {
    return this.session()?.token ?? null;
  }

  logout() {
    localStorage.removeItem(KEY);
  }
}
