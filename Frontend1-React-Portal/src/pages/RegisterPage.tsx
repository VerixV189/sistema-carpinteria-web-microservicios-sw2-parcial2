import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { homeFor, saveSession } from '../auth';
import { Icon } from '../icons';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken } = await api.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      const session = saveSession(accessToken, form.email.trim());
      navigate(homeFor(session.role));
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg.includes('existe') ? 'Ya existe una cuenta con ese correo' : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <form onSubmit={submit} style={s.card}>
        <div style={s.head}>
          <img src="/logo_el_roble.png" alt="Carpintería El Roble" style={s.logoImg} />
          <h2 style={s.title}>Crea tu cuenta</h2>
          <p style={s.sub}>Regístrate para cotizar y hacer seguimiento a tus pedidos</p>
        </div>
        <label style={s.label}>Nombre completo
          <input required value={form.name} onChange={set('name')} placeholder="María González" style={s.input} />
        </label>
        <label style={s.label}>Correo electrónico
          <input type="email" required value={form.email} onChange={set('email')} placeholder="tu@correo.com" style={s.input} />
        </label>
        <label style={s.label}>Contraseña (mínimo 6 caracteres)
          <input type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="••••••••" style={s.input} />
        </label>
        <label style={s.label}>Teléfono (opcional)
          <input value={form.phone} onChange={set('phone')} placeholder="700-00000" style={s.input} />
        </label>
        <label style={s.label}>Dirección (opcional)
          <input value={form.address} onChange={set('address')} placeholder="Calle, zona, ciudad" style={s.input} />
        </label>
        {error && <p style={s.error}><Icon name="alert" size={14} /> {error}</p>}
        <button style={s.btn} disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Registrarme'}
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.href = api.googleSsoUrl('/login');
          }}
          style={s.googleBtn}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Registrarme con Google
        </button>

        <p style={s.alt}>¿Ya tienes cuenta? <Link to="/login" style={s.link}>Ingresa aquí</Link></p>
      </form>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', background: '#F5F1EC', padding: '24px 0' },
  card: { background: '#fff', padding: '32px', borderRadius: 12, boxShadow: '0 8px 24px rgba(59,47,47,.12)', display: 'flex', flexDirection: 'column', gap: 12, width: 380 },
  head: { textAlign: 'center', marginBottom: 6 },
  logoImg: { width: 64, height: 64, borderRadius: 14, objectFit: 'cover', marginBottom: 10, boxShadow: '0 4px 12px rgba(59,47,47,.16)' },
  title: { margin: 0, color: '#3B2F2F', fontSize: 20 },
  sub: { margin: '4px 0 0', color: '#8a7f75', fontSize: 13 },
  label: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, color: '#5c534a', fontWeight: 600 },
  input: { padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd4c8', fontSize: 14, outline: 'none' },
  error: { display: 'flex', alignItems: 'center', gap: 6, margin: 0, color: '#a33', fontSize: 13, background: '#fdf1f1', padding: '8px 12px', borderRadius: 6 },
  btn: { background: '#8B5A2B', color: '#fff', border: 'none', padding: '11px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, marginTop: 4 },
  googleBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#fff', color: '#3c4043', border: '1px solid #dadce0', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  alt: { margin: 0, textAlign: 'center', fontSize: 13, color: '#8a7f75' },
  link: { color: '#8B5A2B', fontWeight: 600 },
};
