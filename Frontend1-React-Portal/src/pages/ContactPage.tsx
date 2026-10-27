import { Link } from 'react-router-dom';
import { Icon } from '../icons';
import { getSession } from '../auth';

const CHANNELS = [
  { icon: 'phone' as const, label: 'Teléfono', value: '+591 3 333-4444' },
  { icon: 'chat' as const, label: 'WhatsApp', value: '+591 7 555-6666' },
  { icon: 'mail' as const, label: 'Email', value: 'contacto@carpinteria.com' },
  { icon: 'pin' as const, label: 'Taller', value: 'Av. Banzer Km 6, Santa Cruz de la Sierra' },
];

export default function ContactPage() {
  const session = getSession();
  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.h1}>Contacto</h1>
        <p style={s.sub}>Visítanos en el taller o escríbenos — respondemos el mismo día hábil.</p>

        <div style={s.grid}>
          {CHANNELS.map((c) => (
            <div key={c.label} style={s.card}>
              <span style={s.icon}><Icon name={c.icon} size={20} /></span>
              <div>
                <div style={s.label}>{c.label}</div>
                <div style={s.value}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={s.hours}>
          <h2 style={s.h2}><Icon name="clock" size={18} style={{ verticalAlign: -3, marginRight: 8 }} />Horarios de atención</h2>
          <table style={s.table}>
            <tbody>
              <tr><td>Lunes – Viernes</td><td style={s.td}>08:00 – 18:00</td></tr>
              <tr><td>Sábado</td><td style={s.td}>08:00 – 13:00</td></tr>
              <tr><td>Domingo</td><td style={s.td}>Cerrado</td></tr>
            </tbody>
          </table>
        </div>

        <div style={s.cta}>
          <p style={{ margin: 0, color: '#5c534a' }}>¿Listo para cotizar tu mueble?</p>
          <Link to={session ? '/cotizar' : '/login?next=/cotizar'} style={s.btn}>
            Solicitar cotización <Icon name="arrow" size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { background: '#F5F1EC', minHeight: 'calc(100vh - 64px)', fontFamily: 'Inter, system-ui, sans-serif', padding: '40px 0 64px' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  h1: { margin: '0 0 8px', color: '#3B2F2F', fontSize: 30 },
  sub: { margin: '0 0 28px', color: '#8a7f75', fontSize: 15 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 },
  card: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.07)' },
  icon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 10, background: '#F0E7DC', color: '#8B5A2B', flexShrink: 0 },
  label: { fontSize: 12, color: '#8a7f75', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 700 },
  value: { fontSize: 15, color: '#3B2F2F', fontWeight: 600, marginTop: 2 },
  hours: { background: '#fff', borderRadius: 12, padding: '22px 26px', marginTop: 28, boxShadow: '0 1px 3px rgba(0,0,0,.07)' },
  h2: { color: '#3B2F2F', fontSize: 18, margin: '0 0 14px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14, color: '#5c534a' },
  td: { textAlign: 'right', fontWeight: 600, color: '#3B2F2F', padding: '8px 0', borderBottom: '1px solid #f0e7dc' },
  cta: { marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, padding: '20px 26px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: '#8B5A2B', color: '#fff', padding: '11px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 },
};
