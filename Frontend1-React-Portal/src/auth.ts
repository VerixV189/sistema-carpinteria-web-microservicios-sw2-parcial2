/** Sesión: token JWT + rol decodificado del payload. Sin bypass. */

export interface Session {
  token: string;
  email: string;
  role: 'ADMIN' | 'CLIENT' | 'CARPENTER';
}

const KEY = 'carpinteria_session';

function decodeRole(token: string): Session['role'] {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? 'CLIENT';
  } catch {
    return 'CLIENT';
  }
}

export function saveSession(token: string, email: string): Session {
  const session: Session = { token, email, role: decodeRole(token) };
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
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

export function clearSession() {
  localStorage.removeItem(KEY);
}

/** Destino post-login según rol. */
export function homeFor(role: Session['role']): string {
  return role === 'ADMIN' ? '/admin/clientes' : role === 'CARPENTER' ? '/taller' : '/cotizar';
}
