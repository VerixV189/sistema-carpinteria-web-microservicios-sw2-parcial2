import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getSession } from '../auth';
import { Icon, Icons } from '../icons';

interface NavLink {
  to: string;
  label: string;
  icon: keyof typeof Icons;
  roles?: Array<'ADMIN' | 'CLIENT' | 'CARPENTER'>; // undefined = siempre visible
}

const LINKS: NavLink[] = [
  // Públicas — el portal también es la vitrina del negocio
  { to: '/', label: 'Inicio', icon: 'home' },
  { to: '/productos', label: 'Productos', icon: 'package' },
  { to: '/nosotros', label: 'Nosotros', icon: 'info' },
  { to: '/contacto', label: 'Contacto', icon: 'mail' },
  // Zona cliente (autenticada)
  { to: '/cotizar', label: 'Cotizar', icon: 'quote', roles: ['CLIENT', 'ADMIN'] },
  { to: '/mis-cotizaciones', label: 'Mis Cotizaciones', icon: 'chat', roles: ['CLIENT', 'ADMIN'] },
  { to: '/recibos', label: 'Mis Recibos', icon: 'receipt', roles: ['CLIENT', 'ADMIN'] },
  // Microfrontends por rol
  { to: '/admin/clientes', label: 'Administración', icon: 'dashboard', roles: ['ADMIN'] },
  { to: '/taller', label: 'Taller', icon: 'workshop', roles: ['CARPENTER', 'ADMIN'] },
];

const ROLE_LABEL: Record<string, string> = { ADMIN: 'Administrador', CLIENT: 'Cliente', CARPENTER: 'Carpintero' };

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = getSession();

  const logout = () => {
    clearSession();
    navigate('/login');
  };

  const visible = LINKS.filter((l) => !l.roles || (session && l.roles.includes(session.role)));

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`) ||
    (to === '/admin/clientes' && pathname.startsWith('/admin'));

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <span style={styles.logo}>ER</span>
        <span>Carpintería El Roble</span>
      </Link>
      <div style={styles.links}>
        {visible.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            style={{ ...styles.link, ...(isActive(l.to) ? styles.active : {}) }}
          >
            <Icon name={l.icon} size={15} />
            {l.label}
          </Link>
        ))}
      </div>
      <div style={styles.userArea}>
        {session ? (
          <>
            <span style={styles.badge}>
              <Icon name="user" size={13} />
              {ROLE_LABEL[session.role] ?? session.role}
            </span>
            <button onClick={logout} style={styles.btn} title={session.email}>
              <Icon name="logout" size={14} />
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" style={styles.btn}>
            <Icon name="lock" size={14} />
            Ingresar
          </Link>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', height: 64, background: '#3B2F2F', color: '#FAF7F2',
    boxShadow: '0 2px 8px rgba(0,0,0,.2)', position: 'sticky', top: 0, zIndex: 100,
    gap: 12,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, color: '#FAF7F2', textDecoration: 'none', fontWeight: 700, fontSize: 17 },
  logo: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 8, background: '#8B5A2B',
    color: '#FAF7F2', fontSize: 13, fontWeight: 800, letterSpacing: 0.5,
  },
  links: { display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', minWidth: 0, flexShrink: 1 },
  link: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    color: '#D4A574', textDecoration: 'none', padding: '8px 14px', borderRadius: 6, fontSize: 14,
  },
  active: { background: 'rgba(212,165,116,.15)', color: '#fff' },
  userArea: { display: 'flex', alignItems: 'center', gap: 10 },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'rgba(212,165,116,.12)', color: '#D4A574',
    padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
  },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#8B5A2B', color: '#fff', border: 'none', padding: '8px 16px',
    borderRadius: 6, cursor: 'pointer', textDecoration: 'none', fontSize: 14,
  },
};
