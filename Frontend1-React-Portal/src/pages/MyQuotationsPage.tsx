import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getSession } from '../auth';
import { formatBs } from '../catalog';
import { Icon } from '../icons';

// Mis cotizaciones — el cliente decide sobre el precio formal del taller:
// aceptar (y pagar), proponer otro precio (contraoferta) o no le interesa.
const ESTADO: Record<string, { texto: string; color: string; fondo: string }> = {
  DRAFT: { texto: 'En revisión del taller', color: '#B4690E', fondo: '#FDF3E3' },
  QUOTED: { texto: 'Precio listo — te toca decidir', color: '#1a5276', fondo: '#EAF2FA' },
  APPROVED: { texto: 'Aceptada por ti', color: '#1E7B45', fondo: '#E8F7EE' },
  REJECTED: { texto: 'Cancelada', color: '#a33', fondo: '#fdf1f1' },
  CONVERTED: { texto: 'Ya es tu pedido', color: '#1E7B45', fondo: '#E8F7EE' },
};

const fmtFecha = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso
    : d.toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function MyQuotationsPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  // Contraoferta inline por cotización
  const [counterFor, setCounterFor] = useState<string | null>(null);
  const [counterMsg, setCounterMsg] = useState('');
  const [counterPrice, setCounterPrice] = useState('');
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const navigate = useNavigate();
  const session = getSession();

  const cargar = () => {
    if (!session?.email) return;
    api.myQuotations(session.email)
      .then(setLista)
      .catch(() => setError('No pudimos cargar tus cotizaciones.'))
      .finally(() => setLoading(false));
  };
  useEffect(cargar, []);

  const responder = async (id: string, action: 'accept' | 'reject' | 'counter') => {
    setError('');
    setBusy(id + action);
    try {
      const q = await api.respondQuotation(id, {
        action,
        message: action === 'counter' ? counterMsg.trim() : undefined,
        counterAmount: counterPrice ? Number(counterPrice) : undefined,
      });
      setCounterFor(null);
      setCounterMsg('');
      setCounterPrice('');
      setConfirmReject(null);
      if (action === 'accept') {
        // Pago completo al aceptar → directo a la pantalla de pago
        navigate(`/pagar/${q.id}`);
        return;
      }
      cargar();
    } catch {
      setError('No se pudo enviar tu respuesta. Intenta de nuevo.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Mis cotizaciones</h1>
      <p style={s.sub}>Aquí ves los precios que el taller te envía y decides si aceptas.</p>

      {loading && <p style={s.muted}>Cargando…</p>}
      {error && <p style={s.error}><Icon name="alert" size={14} /> {error}</p>}

      {!loading && lista.length === 0 && !error && (
        <div style={{ ...s.card, textAlign: 'center' }}>
          <p style={{ ...s.muted, marginBottom: 14 }}>Todavía no pediste ninguna cotización.</p>
          <Link to="/cotizar" style={{ ...s.btn, textDecoration: 'none' }}>Cotizar mi mueble</Link>
        </div>
      )}

      <div style={s.grid}>
        {lista.map((q) => {
          const est = ESTADO[q.status] ?? ESTADO.DRAFT;
          const precio = q.finalAmount ?? q.payableAmount ?? q.totalAmount;
          const esOferta = q.status === 'QUOTED';
          return (
            <div key={q.id} style={s.card}>
              <div style={s.cardTop}>
                <span style={{ ...s.badge, background: est.fondo, color: est.color }}>{est.texto}</span>
                <span style={s.fecha}>{fmtFecha(q.updatedAt ?? q.createdAt)}</span>
              </div>

              <p style={s.desc}>{q.items?.[0]?.description ?? 'Mueble a medida'}</p>

              {q.delivery && (
                <p style={s.entrega}>
                  <Icon name={q.delivery.type === 'PICKUP' ? 'workshop' : 'truck'} size={14} />
                  {q.delivery.type === 'PICKUP'
                    ? ' Recoges en el taller'
                    : ` Envío a: ${q.delivery.address ?? 'tu ubicación'}`}
                </p>
              )}

              <div style={s.precioRow}>
                <span style={s.muted}>{esOferta ? 'Precio del taller' : 'Precio estimado'}</span>
                <strong style={s.precio}>{formatBs(precio ?? 0)}</strong>
              </div>

              {q.status === 'DRAFT' && (
                <p style={s.nota}>
                  <Icon name="clock" size={14} /> El taller está revisando tu solicitud
                  {q.clientMessage ? ' — enviaste un mensaje, te responderán pronto.' : '.'}
                </p>
              )}

              {esOferta && (
                <>
                  <div style={s.acciones}>
                    <button style={{ ...s.btn, flex: 1 }} disabled={!!busy}
                      onClick={() => responder(q.id, 'accept')}>
                      {busy === q.id + 'accept' ? 'Aceptando…' : 'Aceptar y pagar'}
                    </button>
                    <button style={s.btnSec} disabled={!!busy}
                      onClick={() => setCounterFor(counterFor === q.id ? null : q.id)}>
                      Proponer otro precio
                    </button>
                    <button style={s.btnRechazar} disabled={!!busy}
                      onClick={() => setConfirmReject(q.id)}>
                      No me interesa
                    </button>
                  </div>

                  {counterFor === q.id && (
                    <div style={s.counterBox}>
                      <label style={s.dirLabel}>
                        Tu propuesta para el taller
                        <textarea value={counterMsg} onChange={(e) => setCounterMsg(e.target.value)}
                          rows={2} style={s.textarea}
                          placeholder="Ej: ¿Me lo pueden dejar en 2000? O: sin cajones internos" />
                      </label>
                      <label style={s.dirLabel}>
                        Precio que propones (opcional)
                        <input value={counterPrice} style={s.input} inputMode="numeric"
                          placeholder="Ej: 2000"
                          onChange={(e) => setCounterPrice(e.target.value.replace(/\D/g, ''))} />
                      </label>
                      <button style={{ ...s.btn, alignSelf: 'stretch' }}
                        disabled={!counterMsg.trim() || !!busy}
                        onClick={() => responder(q.id, 'counter')}>
                        <Icon name="send" size={15} />
                        {busy === q.id + 'counter' ? 'Enviando…' : 'Enviar propuesta al taller'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {q.status === 'APPROVED' && (
                <Link to={`/pagar/${q.id}`} style={{ ...s.btn, textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                  Pagar {formatBs(precio ?? 0)} <Icon name="arrow" size={15} />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmación de rechazo */}
      {confirmReject && (
        <div style={s.overlay} onClick={() => setConfirmReject(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.h2}>¿Cancelar esta cotización?</h2>
            <p style={s.muted}>Si no te interesa el precio, puedes proponer otro en vez de cancelar.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ ...s.btnSec, flex: 1 }} onClick={() => setConfirmReject(null)}>
                Volver
              </button>
              <button style={{ ...s.btnRechazar, flex: 1 }} disabled={!!busy}
                onClick={() => responder(confirmReject, 'reject')}>
                {busy === confirmReject + 'reject' ? 'Cancelando…' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '26px 20px 60px' },
  h1: { margin: 0, fontSize: 26, color: '#3B2F2F' },
  sub: { margin: '6px 0 22px', color: '#8a7f75', fontSize: 15 },
  muted: { color: '#8a7f75', fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 },
  card: { background: '#fff', borderRadius: 14, padding: '18px 18px', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 },
  badge: { fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 },
  fecha: { fontSize: 12, color: '#b3a89c' },
  desc: { margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#3B2F2F' },
  entrega: { display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 10px', color: '#8a7f75', fontSize: 13 },
  precioRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FDF6EE', borderRadius: 10, padding: '10px 14px', marginBottom: 12 },
  precio: { fontSize: 24, color: '#8B5A2B', fontWeight: 800 },
  nota: { display: 'flex', alignItems: 'center', gap: 6, margin: 0, color: '#8a7f75', fontSize: 13 },
  acciones: { display: 'flex', flexDirection: 'column', gap: 8 },
  btn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#8B5A2B', color: '#fff', border: 'none', padding: '13px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15, fontFamily: 'inherit' },
  btnSec: { background: '#fff', border: '1.5px solid #D4A574', color: '#6B4F2E', padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' },
  btnRechazar: { background: 'none', border: '1.5px solid #ddd4c8', color: '#a33', padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' },
  counterBox: { marginTop: 12, background: '#FAF7F2', borderRadius: 12, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, border: '1.5px dashed #D4A574' },
  dirLabel: { fontSize: 13, fontWeight: 600, color: '#5c534a', display: 'flex', flexDirection: 'column', gap: 6 },
  textarea: { width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #ddd4c8', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' },
  input: { padding: '12px 14px', borderRadius: 10, border: '1.5px solid #ddd4c8', fontSize: 15, fontFamily: 'inherit' },
  error: { display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 14px', color: '#a33', fontSize: 13, background: '#fdf1f1', padding: '10px 12px', borderRadius: 8 },
  h2: { margin: '0 0 8px', fontSize: 18, color: '#3B2F2F' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, padding: 16 },
  modal: { background: '#fff', borderRadius: 14, padding: '22px 20px', maxWidth: 400, width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,.25)' },
};
