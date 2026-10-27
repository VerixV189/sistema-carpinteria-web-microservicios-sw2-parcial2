import { Link } from 'react-router-dom';
import { PRODUCTS, WOODS, formatBs } from '../catalog';
import { Icon } from '../icons';
import { getSession } from '../auth';

export default function CatalogPage() {
  const session = getSession();
  const quoteLink = session ? '/cotizar' : '/login?next=/cotizar';

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.h1}>Catálogo de productos</h1>
        <p style={s.sub}>
          Todo se fabrica a medida. El precio mostrado es la base en melamina estándar —
          la madera, las medidas y los acabados ajustan el total.
        </p>

        <div style={s.grid}>
          {PRODUCTS.map((p) => (
            <div key={p.key} style={s.card}>
              <div style={s.imgWrap}>
                <img src={p.image} alt={p.name} loading="lazy" style={s.img} />
              </div>
              <div style={s.cardBody}>
                <h3 style={s.name}>{p.name}</h3>
                <p style={s.desc}>{p.description}</p>
                <div style={s.foot}>
                  <span style={s.price}>desde {formatBs(p.basePrice)}</span>
                  <Link to={quoteLink} style={s.btn}>Cotizar <Icon name="arrow" size={13} /></Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section style={s.woods}>
          <h2 style={s.h2}><Icon name="tree" size={20} style={{ verticalAlign: -3, marginRight: 8 }} />Maderas que trabajamos</h2>
          <div style={s.woodGrid}>
            {WOODS.map((w) => (
              <div key={w.name} style={s.woodCard}>
                <strong style={{ color: '#3B2F2F' }}>{w.name}</strong>
                <span style={{ color: '#8a7f75', fontSize: 13 }}>{w.note}</span>
                <span style={s.tag}>{w.factor}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { background: '#F5F1EC', minHeight: 'calc(100vh - 64px)', fontFamily: 'Inter, system-ui, sans-serif', padding: '40px 0 64px' },
  container: { maxWidth: 1400, margin: '0 auto', padding: '0 24px' },
  h1: { margin: '0 0 8px', color: '#3B2F2F', fontSize: 30 },
  sub: { margin: '0 0 32px', color: '#8a7f75', fontSize: 15, maxWidth: 640, lineHeight: 1.6 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 },
  card: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  imgWrap: { width: '100%', aspectRatio: '8 / 5', background: '#EDE6DD' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardBody: { padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 },
  name: { margin: '0 0 8px', color: '#3B2F2F', fontSize: 17 },
  desc: { margin: '0 0 18px', color: '#6d6157', fontSize: 13, lineHeight: 1.55, flex: 1 },
  foot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: '#8B5A2B', fontWeight: 700, fontSize: 15 },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 5, background: '#3B2F2F', color: '#FAF7F2', padding: '8px 14px', borderRadius: 7, textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  woods: { marginTop: 56 },
  h2: { color: '#3B2F2F', fontSize: 22, margin: '0 0 20px' },
  woodGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 },
  woodCard: { background: '#fff', borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 6, boxShadow: '0 1px 3px rgba(0,0,0,.06)' },
  tag: { alignSelf: 'flex-start', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: '#8B5A2B', background: '#F0E7DC', padding: '3px 8px', borderRadius: 10 },
};
