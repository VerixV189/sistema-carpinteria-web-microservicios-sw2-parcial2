import { useState } from 'react';
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
          <span style={s.logo}>ER</span>
          <h2 style={s.title}>Carpintería El Roble</h2>
          <p style={s.sub}>Acceso al sistema de gestión</p>
        </div>
        <label style={s.label}>
          Email
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
  logo: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 48, height: 48, borderRadius: 12, background: '#8B5A2B',
    color: '#FAF7F2', fontSize: 18, fontWeight: 800, marginBottom: 12,
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
  alt: { margin: 0, textAlign: 'center', fontSize: 13, color: '#8a7f75' },
  link: { color: '#8B5A2B', fontWeight: 600 },
};
