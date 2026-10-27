import { Icon } from '../icons';

const STEPS = [
  { icon: 'chat' as const, title: '1. Conversamos', text: 'Nos cuentas qué necesitas: medidas, estilo, presupuesto. Puedes subir una foto de referencia.' },
  { icon: 'quote' as const, title: '2. Cotización', text: 'Te damos un precio estimado al instante con apoyo de IA y lo afinamos juntos.' },
  { icon: 'workshop' as const, title: '3. Fabricación', text: 'Nuestros carpinteros construyen tu mueble en el taller con control de calidad por etapa.' },
  { icon: 'truck' as const, title: '4. Entrega programada', text: 'Elegimos juntos la fecha y el turno. Verificamos capacidad antes de confirmar.' },
];

export default function AboutPage() {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.h1}>Nuestra empresa</h1>
        <p style={s.lead}>
          <strong>Carpintería El Roble</strong> es un taller familiar de Santa Cruz dedicado
          al mueble a medida. Combinamos el oficio artesanal con herramientas digitales:
          cotización asistida por IA, seguimiento de pedidos en línea y entrega programada.
        </p>

        <h2 style={s.h2}>Cómo trabajamos</h2>
        <div style={s.grid}>
          {STEPS.map((st) => (
            <div key={st.title} style={s.step}>
              <span style={s.stepIcon}><Icon name={st.icon} size={22} /></span>
              <h3 style={s.stepTitle}>{st.title}</h3>
              <p style={s.stepText}>{st.text}</p>
            </div>
          ))}
        </div>

        <div style={s.values}>
          <h2 style={s.h2}>Nuestros valores</h2>
          <ul style={s.list}>
            <li><Icon name="check" size={15} style={s.check} /> Materiales certificados y madera de reforestación.</li>
            <li><Icon name="check" size={15} style={s.check} /> Precio cerrado por escrito antes de fabricar.</li>
            <li><Icon name="check" size={15} style={s.check} /> Entrega confirmada por fecha y turno — sin sorpresas.</li>
            <li><Icon name="check" size={15} style={s.check} /> Garantía de 12 meses en estructura y herrajes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { background: '#F5F1EC', minHeight: 'calc(100vh - 64px)', fontFamily: 'Inter, system-ui, sans-serif', padding: '40px 0 64px' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  h1: { margin: '0 0 12px', color: '#3B2F2F', fontSize: 30 },
  lead: { color: '#5c534a', fontSize: 16, lineHeight: 1.7, margin: '0 0 40px' },
  h2: { color: '#3B2F2F', fontSize: 22, margin: '0 0 20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 44 },
  step: { background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' },
  stepIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 10, background: '#F0E7DC', color: '#8B5A2B', marginBottom: 12 },
  stepTitle: { margin: '0 0 6px', color: '#3B2F2F', fontSize: 15 },
  stepText: { margin: 0, color: '#6d6157', fontSize: 13, lineHeight: 1.55 },
  values: { background: '#fff', borderRadius: 12, padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, color: '#5c534a', fontSize: 14 },
  check: { color: '#8B5A2B', marginRight: 8, verticalAlign: -2 },
};
