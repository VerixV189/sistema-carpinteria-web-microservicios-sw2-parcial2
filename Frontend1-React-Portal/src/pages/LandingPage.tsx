import { Link } from 'react-router-dom';
import { PRODUCTS, formatBs } from '../catalog';
import { Icon } from '../icons';
import { getSession } from '../auth';

const VALUES = [
  { icon: 'ruler' as const, title: 'Diseño a medida', text: 'Cada mueble se fabrica según tus medidas exactas y el estilo de tu espacio.' },
  { icon: 'tree' as const, title: 'Madera real', text: 'Trabajamos mara, roble, cedro, pino y melamina de proveedores certificados.' },
  { icon: 'truck' as const, title: 'Entrega programada', text: 'Coordinamos la fecha y el turno de entrega contigo antes de producir.' },
];

export default function LandingPage() {
  const session = getSession();
  const featured = PRODUCTS.slice(0, 4);

  return (
    <div style={s.page}>
      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <span style={s.heroTag}>Carpintería El Roble · Santa Cruz, Bolivia</span>
          <h1 style={s.heroTitle}>Muebles a medida,<br />hechos a mano</h1>
          <p style={s.heroText}>
            Diseñamos y fabricamos muebles personalizados en madera noble:
            roperos, cocinas, puertas y todo lo que tu espacio necesita.
          </p>
          <div style={s.heroActions}>
            <Link to="/productos" style={s.btnPrimary}>
              Ver catálogo <Icon name="arrow" size={16} />
            </Link>
            <Link to={session ? '/cotizar' : '/login?next=/cotizar'} style={s.btnGhost}>
              Solicitar cotización
            </Link>
          </div>
        </div>
      </section>

      {/* Propuesta de valor */}
      <section style={s.section}>
        <div style={s.valuesGrid}>
          {VALUES.map((v) => (
            <div key={v.title} style={s.valueCard}>
              <span style={s.valueIcon}><Icon name={v.icon} size={26} /></span>
              <h3 style={s.valueTitle}>{v.title}</h3>
              <p style={s.valueText}>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section style={{ ...s.section, background: '#fff' }}>
        <h2 style={s.h2}>Productos destacados</h2>
        <p style={s.h2sub}>Precios referenciales en melamina estándar — el precio final depende de madera, medidas y acabados.</p>
        <div style={s.grid}>
          {featured.map((p) => (
            <div key={p.key} style={s.card}>
              <div style={s.cardImgWrap}>
                <img src={p.image} alt={p.name} loading="lazy" style={s.cardImg} />
              </div>
              <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={s.cardTitle}>{p.name}</h3>
                <p style={s.cardText}>{p.description}</p>
                <div style={s.cardFoot}>
                  <span style={s.price}>desde {formatBs(p.basePrice)}</span>
                  <Link to={session ? '/cotizar' : '/login?next=/cotizar'} style={s.cardLink}>
                    Cotizar <Icon name="arrow" size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/productos" style={s.btnPrimary}>Ver todo el catálogo <Icon name="arrow" size={16} /></Link>
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <h2 style={{ margin: '0 0 10px', fontSize: 26 }}>¿Tienes un proyecto en mente?</h2>
        <p style={{ margin: '0 0 22px', color: '#D4A574', fontSize: 15 }}>
          Sube una foto de referencia y nuestra IA te da una estimación de precio al instante.
        </p>
        <Link to={session ? '/cotizar' : '/login?next=/cotizar'} style={{ ...s.btnPrimary, background: '#FAF7F2', color: '#3B2F2F' }}>
          Cotizar ahora <Icon name="arrow" size={16} />
        </Link>
      </section>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { background: '#F5F1EC', minHeight: 'calc(100vh - 64px)', fontFamily: 'Inter, system-ui, sans-serif' },
  hero: { background: '#3B2F2F', color: '#FAF7F2', padding: '72px 24px' },
  heroInner: { maxWidth: 860, margin: '0 auto', textAlign: 'center' },
  heroTag: { display: 'inline-block', color: '#D4A574', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 18 },
  heroTitle: { margin: '0 0 18px', fontSize: 44, lineHeight: 1.15, fontWeight: 800 },
  heroText: { margin: '0 auto 30px', maxWidth: 560, color: '#CBB9A6', fontSize: 16, lineHeight: 1.6 },
  heroActions: { display: 'flex', gap: 12, justifyContent: 'center' },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 8, background: '#8B5A2B',
    color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none',
    fontWeight: 600, fontSize: 15,
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent',
    color: '#D4A574', padding: '12px 24px', borderRadius: 8, textDecoration: 'none',
    fontWeight: 600, fontSize: 15, border: '1px solid #6b5a45',
  },
  section: { padding: '48px 24px', maxWidth: 1320, margin: '0 auto' },
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 },
  valueCard: { background: '#fff', borderRadius: 12, padding: '26px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' },
  valueIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 12, background: '#F0E7DC', color: '#8B5A2B', marginBottom: 14 },
  valueTitle: { margin: '0 0 8px', color: '#3B2F2F', fontSize: 17 },
  valueText: { margin: 0, color: '#6d6157', fontSize: 14, lineHeight: 1.55 },
  h2: { textAlign: 'center', margin: '0 0 8px', color: '#3B2F2F', fontSize: 28 },
  h2sub: { textAlign: 'center', color: '#8a7f75', margin: '0 0 32px', fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 },
  card: { background: '#FDFBF8', border: '1px solid #EDE4D8', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  cardImgWrap: { width: '100%', aspectRatio: '8 / 5', background: '#EDE6DD' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardTitle: { margin: '0 0 8px', color: '#3B2F2F', fontSize: 16 },
  cardText: { margin: '0 0 16px', color: '#6d6157', fontSize: 13, lineHeight: 1.5, flex: 1 },
  cardFoot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: '#8B5A2B', fontWeight: 700, fontSize: 14 },
  cardLink: { display: 'inline-flex', alignItems: 'center', gap: 4, color: '#3B2F2F', fontSize: 13, fontWeight: 600, textDecoration: 'none' },
  cta: { background: '#3B2F2F', color: '#FAF7F2', textAlign: 'center', padding: '56px 24px' },
};
