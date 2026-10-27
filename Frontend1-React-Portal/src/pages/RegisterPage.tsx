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
          <span style={s.logo}>ER</span>
          <h2 style={s.title}>Crea tu cuenta</h2>
          <p style={s.sub}>Regístrate para cotizar y hacer seguimiento a tus pedidos</p>
        </div>
        <label style={s.label}>Nombre completo
          <input required value={form.name} onChange={set('name')} placeholder="María González" style={s.input} />
        </label>
        <label style={s.label}>Email
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
        <p style={s.alt}>¿Ya tienes cuenta? <Link to="/login" style={s.link}>Ingresa aquí</Link></p>
      </form>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', background: '#F5F1EC', padding: '24px 0' },
  card: { background: '#fff', padding: '32px', borderRadius: 12, boxShadow: '0 8px 24px rgba(59,47,47,.12)', display: 'flex', flexDirection: 'column', gap: 12, width: 380 },
  head: { textAlign: 'center', marginBottom: 6 },
  logo: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, background: '#8B5A2B', color: '#FAF7F2', fontSize: 18, fontWeight: 800, marginBottom: 12 },
  title: { margin: 0, color: '#3B2F2F', fontSize: 20 },
  sub: { margin: '4px 0 0', color: '#8a7f75', fontSize: 13 },
  label: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, color: '#5c534a', fontWeight: 600 },
  input: { padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd4c8', fontSize: 14, outline: 'none' },
  error: { display: 'flex', alignItems: 'center', gap: 6, margin: 0, color: '#a33', fontSize: 13, background: '#fdf1f1', padding: '8px 12px', borderRadius: 6 },
  btn: { background: '#8B5A2B', color: '#fff', border: 'none', padding: '11px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, marginTop: 4 },
  alt: { margin: 0, textAlign: 'center', fontSize: 13, color: '#8a7f75' },
  link: { color: '#8B5A2B', fontWeight: 600 },
};
