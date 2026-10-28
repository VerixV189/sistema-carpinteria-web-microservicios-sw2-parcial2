/** Sesión del taller — mismo formato que el portal (JWT del gateway). */

export interface Session {
  token: string;
  email: string;
  role: 'ADMIN' | 'CLIENT' | 'CARPENTER';
}

const KEY = 'carpinteria_session';
const HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const LOGIN_URL = `http://${HOST}:3000/auth/login`;

function decodeRole(token: string): Session['role'] {
  try {
    return JSON.parse(atob(token.split('.')[1])).role ?? 'CLIENT';
  } catch {
    return 'CLIENT';
  }
}

export async function login(email: string, password: string): Promise<Session> {
  const r = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error('Credenciales inválidas');
  const { accessToken } = await r.json();
  const session: Session = { token: accessToken, email, role: decodeRole(accessToken) };
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function session(): Session | null {
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
export function acceptHandoff() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) return;
  const s: Session = { token, email: params.get('email') ?? '', role: decodeRole(token) };
  localStorage.setItem(KEY, JSON.stringify(s));
  params.delete('token');
  params.delete('email');
  const qs = params.toString();
  window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
}

/** Guard del taller: exige CARPENTER o ADMIN. */
export function requireWorkshop(): boolean {
  const s = session();
  return !!s && (s.role === 'CARPENTER' || s.role === 'ADMIN');
}

export function logout() {
  localStorage.removeItem(KEY);
}
