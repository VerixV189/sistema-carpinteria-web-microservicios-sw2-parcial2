import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { homeFor, saveSession } from '../auth';
import { Icon } from '../icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next'); // ej. /cotizar tras ver el catálogo

  // Recepción del callback de SSO Federado Externo (Google OAuth 2.0 / OIDC)
  useEffect(() => {
    const ssoToken = params.get('token');
    const ssoEmail = params.get('email');
    const ssoError = params.get('sso_error');
    if (ssoError) {
      setError(ssoError);
      return;
    }
    if (ssoToken && ssoEmail) {
      const session = saveSession(ssoToken, ssoEmail);
      if (next && (session.role === 'CLIENT' || session.role === 'ADMIN')) {
        navigate(next, { replace: true });
      } else {
        navigate(homeFor(session.role), { replace: true });
      }
    }
  }, [params, next, navigate]);

  const handleGoogleLogin = () => {
    const returnPath = next ? `/login?next=${encodeURIComponent(next)}` : '/login';
    window.location.href = api.googleSsoUrl(returnPath);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken } = await api.login(email.trim(), password);
      const session = saveSession(accessToken, email.trim());
      // 'next' solo aplica si el rol lo permite (cliente/admin a zona cliente)
      if (next && (session.role === 'CLIENT' || session.role === 'ADMIN')) {
        navigate(next);
      } else {
        navigate(homeFor(session.role));
      }
    } catch {
      setError('Credenciales inválidas o servicio no disponible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <form onSubmit={submit} style={s.card}>
        <div style={s.head}>
          <img src="/logo_el_roble.png" alt="Carpintería El Roble" style={s.logoImg} />
          <h2 style={s.title}>Carpintería El Roble</h2>
          <p style={s.sub}>Acceso al sistema de gestión</p>
        </div>
        <label style={s.label}>
          Correo electrónico
          <input
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@carpinteria.com" style={s.input}
          />
        </label>
        <label style={s.label}>
          Contraseña
          <input
            type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" style={s.input}
          />
        </label>
        {error && (
          <p style={s.error}>
            <Icon name="alert" size={14} /> {error}
          </p>
        )}
        <button style={s.btn} disabled={loading}>
          <Icon name="lock" size={14} />
          {loading ? 'Verificando…' : 'Ingresar'}
        </button>

        <div style={s.dividerRow}>
          <span style={s.dividerLine} />
          <span style={s.dividerText}>o continúa con SSO Federado</span>
          <span style={s.dividerLine} />
        </div>

        <button type="button" onClick={handleGoogleLogin} style={s.googleBtn}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar con Google
        </button>

        <p style={s.alt}>¿Nuevo cliente? <Link to="/registro" style={s.link}>Crea tu cuenta</Link></p>
      </form>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: 'calc(100vh - 64px)', background: '#F5F1EC',
  },
  card: {
    background: '#fff', padding: '36px 32px', borderRadius: 12,
    boxShadow: '0 8px 24px rgba(59,47,47,.12)', display: 'flex',
    flexDirection: 'column', gap: 14, width: 360,
  },
  head: { textAlign: 'center', marginBottom: 8 },
  logoImg: {
    width: 68, height: 68, borderRadius: 14, objectFit: 'cover',
    marginBottom: 10, boxShadow: '0 4px 12px rgba(59,47,47,.16)',
  },
  title: { margin: 0, color: '#3B2F2F', fontSize: 20 },
  sub: { margin: '4px 0 0', color: '#8a7f75', fontSize: 13 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#5c534a', fontWeight: 600 },
  input: {
    padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd4c8',
    fontSize: 14, outline: 'none',
  },
  error: {
    display: 'flex', alignItems: 'center', gap: 6, margin: 0,
    color: '#a33', fontSize: 13, background: '#fdf1f1',
    padding: '8px 12px', borderRadius: 6,
  },
  btn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: '#8B5A2B', color: '#fff', border: 'none', padding: '11px',
    borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, marginTop: 4,
  },
  dividerRow: {
    display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0',
  },
  dividerLine: {
    flex: 1, height: 1, background: '#e5ddd3',
  },
  dividerText: {
    fontSize: 11, color: '#8a7f75', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  googleBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    background: '#fff', color: '#3c4043', border: '1px solid #dadce0', padding: '10px 14px',
    borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
    boxShadow: '0 1px 3px rgba(0,0,0,.05)',
  },
  alt: { margin: 0, textAlign: 'center', fontSize: 13, color: '#8a7f75' },
  link: { color: '#8B5A2B', fontWeight: 600 },
};
