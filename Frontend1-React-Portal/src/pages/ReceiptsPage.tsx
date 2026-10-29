import { useEffect, useState } from 'react';
import { api } from '../api';
import { getSession } from '../auth';
import { formatBs } from '../catalog';
import { Icon } from '../icons';

// Recibos del cliente — tarjetas simples con fecha legible y botón de descarga grande.
export default function ReceiptsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const email = getSession()?.email ?? '';

  useEffect(() => {
    api.invoices(email)
      .then((r) => setInvoices(r.data ?? r ?? []))
      .catch(() => setInvoices([]))
      .finally(() => setCargando(false));
  }, [email]);

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Mis recibos</h1>
      <p style={s.sub}>Aquí aparecen los comprobantes de tus pagos.</p>

      {cargando ? (
        <p style={{ color: '#8a7f75', textAlign: 'center' }}>Buscando tus recibos…</p>
      ) : invoices.length === 0 ? (
        <div style={{ ...s.card, textAlign: 'center', padding: '32px 18px' }}>
          <span style={s.iconoVacio}><Icon name="receipt" size={28} /></span>
          <p style={{ margin: 0, color: '#8a7f75', fontSize: 15 }}>
            Todavía no tienes recibos.<br />Aparecerán aquí cuando hagas un pago.
          </p>
        </div>
      ) : (
        <div style={s.lista}>
          {invoices.map((inv) => (
            <div key={inv.id} style={s.fila}>
              <span style={s.icono}><Icon name="receipt" size={18} /></span>
              <div style={s.filaTexto}>
                <b style={{ fontSize: 15 }}>Recibo {inv.series}-{inv.number}</b>
                <span style={s.fecha}>{fechaBonita(inv.issued_at)}</span>
              </div>
              <b style={s.monto}>{formatBs(inv.total ?? 0)}</b>
              <button style={s.btn} onClick={() => downloadInvoice(inv.id, `${inv.series}-${inv.number}`)}>
                <Icon name="send" size={14} /> Descargar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fechaBonita(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

async function downloadInvoice(id: number | string, name: string) {
  const token = getSession()?.token;
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const rootDomain = host.replace(/^(www|admin|taller|api)\./, '');
  const defaultBase = isHttps ? `https://api.${rootDomain}` : `http://${host}:3000`;
  const base = import.meta.env.VITE_GATEWAY_URL || defaultBase;
  const r = await fetch(`${base}/api/invoices/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!r.ok) { alert('No se pudo descargar el recibo'); return; }
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `recibo-${name}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '26px 20px 60px' },
  h1: { margin: 0, fontSize: 26, color: '#3B2F2F', textAlign: 'center' },
  sub: { margin: '6px 0 22px', color: '#8a7f75', fontSize: 15, textAlign: 'center' },
  card: { background: '#fff', borderRadius: 14, padding: '18px 18px', boxShadow: '0 1px 4px rgba(0,0,0,.08)', marginBottom: 14 },
  lista: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 12 },
  fila: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.08)', flexWrap: 'wrap' },
  filaTexto: { flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 2 },
  icono: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, background: '#F0E7DC', color: '#8B5A2B', flexShrink: 0 },
  iconoVacio: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: '#F0E7DC', color: '#8B5A2B', marginBottom: 10 },
  fecha: { color: '#8a7f75', fontSize: 13 },
  monto: { fontSize: 17, color: '#8B5A2B', whiteSpace: 'nowrap' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 7, background: '#8B5A2B', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', whiteSpace: 'nowrap' },
};
