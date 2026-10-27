import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { getSession } from '../auth';
import { formatBs } from '../catalog';
import { Icon } from '../icons';

// Pago de cotización — diseño simple: monto grande, tarjeta con formato, resultado claro.
export default function PaymentPage() {
  const { quotationId = '' } = useParams();
  const [quotation, setQuotation] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('27');
  const [cvv, setCvv] = useState('123');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quotationId) api.getQuotation(quotationId).then(setQuotation).catch(() => setError('No se pudo cargar la cotización.'));
  }, [quotationId]);

  // Agrupa el número de tarjeta de a 4 dígitos mientras se escribe
  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const pagar = async () => {
    setError('');
    setLoading(true);
    try {
      setResult(await api.pay({
        quotationId,
        clientId: getSession()?.email ?? '',
        amount: quotation?.payableAmount ?? quotation?.totalAmount ?? 0,
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolder: cardHolder || (getSession()?.email ?? 'cliente'),
        expiryMonth: Number(expiryMonth),
        expiryYear: Number(`20${expiryYear}`),
        cvv,
      }));
    } catch {
      setError('No se pudo procesar el pago. Revisa los datos e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const aprobado = result?.status === 'APPROVED';

  return (
    <div style={s.page}>
      {aprobado ? (
        /* ══ ÉXITO ══ */
        <div style={{ ...s.card, textAlign: 'center', borderTop: '4px solid #27AE60' }}>
          <span style={s.okCircle}><Icon name="check" size={30} /></span>
          <h1 style={{ ...s.h1, fontSize: 24 }}>¡Pago realizado!</h1>
          <p style={s.help}>
            Tu recibo llegará por email y WhatsApp en unos minutos.
            El taller ya puede empezar a trabajar en tu mueble.
          </p>
          <Link to="/recibos" style={{ ...s.btn, textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            Ver mis recibos
          </Link>
          <Link to="/" style={{ ...s.btnGhost, display: 'block', marginTop: 10, textDecoration: 'none' }}>Volver al inicio</Link>
        </div>
      ) : (
        <>
          <h1 style={s.h1}>Pago de tu cotización</h1>
          <div style={s.card}>
            <div style={s.totalBox}>
              <span style={s.muted}>Total a pagar</span>
              <strong style={s.total}>{quotation ? formatBs(quotation.payableAmount ?? quotation.totalAmount) : '…'}</strong>
              {quotation?.items?.[0]?.description && (
                <span style={s.muted}>{quotation.items[0].description}</span>
              )}
            </div>

            <label style={s.label}>
              Número de tarjeta
              <input value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))}
                style={s.input} inputMode="numeric" placeholder="1234 5678 9012 3456" />
            </label>
            <p style={s.hint}>Para esta demostración: una tarjeta que empieza con 4242 aprueba, otra rechaza.</p>

            <label style={s.label}>
              Nombre en la tarjeta
              <input value={cardHolder} onChange={(e) => setCardHolder(e.target.value)}
                style={s.input} placeholder="Como aparece en la tarjeta" />
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <label style={{ ...s.label, flex: 1 }}>
                Mes
                <input value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  style={s.input} inputMode="numeric" placeholder="MM" />
              </label>
              <label style={{ ...s.label, flex: 1 }}>
                Año
                <input value={expiryYear} onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  style={s.input} inputMode="numeric" placeholder="AA" />
              </label>
              <label style={{ ...s.label, flex: 1 }}>
                CVV
                <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  style={s.input} inputMode="numeric" type="password" placeholder="•••" />
              </label>
            </div>

            {result && !aprobado && (
              <p style={s.errorBox}><Icon name="alert" size={14} /> El pago fue rechazado. Prueba con otra tarjeta.</p>
            )}
            {error && <p style={s.errorBox}><Icon name="alert" size={14} /> {error}</p>}

            <button onClick={pagar} style={{ ...s.btn, opacity: loading || !quotation ? 0.6 : 1 }}
              disabled={loading || !quotation}>
              {loading ? 'Procesando pago…' : `Pagar ${quotation ? formatBs(quotation.payableAmount ?? quotation.totalAmount) : ''}`}
            </button>
            <p style={s.seguro}><Icon name="lock" size={13} /> Tu pago se procesa de forma segura.</p>
          </div>
        </>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 540, margin: '0 auto', padding: '26px 20px 60px' },
  h1: { margin: '0 0 18px', fontSize: 24, color: '#3B2F2F', textAlign: 'center' },
  card: { background: '#fff', padding: '22px 20px', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,.08)', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  totalBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#FDF6EE', borderRadius: 12, padding: '16px 12px', marginBottom: 6 },
  muted: { color: '#8a7f75', fontSize: 13 },
  total: { fontSize: 32, color: '#8B5A2B', fontWeight: 800 },
  label: { fontSize: 13, fontWeight: 600, color: '#5c534a', display: 'flex', flexDirection: 'column', gap: 6 },
  input: { padding: '12px 14px', borderRadius: 10, border: '1.5px solid #ddd4c8', fontSize: 15, width: '100%', fontFamily: 'inherit' },
  hint: { margin: '-4px 0 4px', color: '#b3a89c', fontSize: 12 },
  errorBox: { display: 'flex', alignItems: 'center', gap: 6, margin: 0, color: '#a33', fontSize: 13, background: '#fdf1f1', padding: '10px 12px', borderRadius: 8 },
  btn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#8B5A2B', color: '#fff', border: 'none', padding: '14px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'inherit' },
  btnGhost: { background: 'none', border: '1.5px solid #ddd4c8', color: '#5c534a', padding: '13px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 15, fontFamily: 'inherit', textAlign: 'center' },
  seguro: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: 0, color: '#8a7f75', fontSize: 12 },
  okCircle: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: '#E8F7EE', color: '#27AE60', marginBottom: 8 },
  help: { margin: '0 0 16px', color: '#6d6157', fontSize: 14, lineHeight: 1.6 },
};
