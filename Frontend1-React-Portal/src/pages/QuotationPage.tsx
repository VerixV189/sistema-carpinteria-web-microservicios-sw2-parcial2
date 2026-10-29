import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { getSession } from '../auth';
import { WOODS, formatBs } from '../catalog';
import { Icon } from '../icons';

// Cotización guiada en 3 pasos — pensada para clientes sin experiencia técnica.
const EJEMPLOS = [
  'Ropero de 3 puertas de 1.8m de alto',
  'Mesa de comedor para 6 personas',
  'Mueble de cocina con gabinetes',
  'Puerta principal con tallado',
  'Escritorio con cajones para oficina',
];

const MUEBLE: Record<string, string> = {
  DOOR: 'Puerta', WINDOW: 'Ventana', TABLE: 'Mesa', CHAIR: 'Silla', BED: 'Cama',
  WARDROBE: 'Ropero', KITCHEN: 'Mueble de cocina', KITCHEN_CABINET: 'Mueble de cocina',
  SHELF: 'Estante', BOOKSHELF: 'Biblioteca', DESK: 'Escritorio', OTHER: 'Mueble',
};

const NIVEL: Record<string, { texto: string; color: string; fondo: string }> = {
  'económico': { texto: 'Económica', color: '#1E7B45', fondo: '#E8F7EE' },
  'media': { texto: 'Intermedia', color: '#B4690E', fondo: '#FDF3E3' },
  'premium': { texto: 'Premium', color: '#8B5A2B', fondo: '#F0E7DC' },
};

export default function QuotationPage() {
  const [searchParams] = useSearchParams();
  const [paso, setPaso] = useState(1);
  const [description, setDescription] = useState(() => searchParams.get('desc') ?? '');
  const [woodType, setWoodType] = useState(() => searchParams.get('wood') ?? '');

  useEffect(() => {
    const d = searchParams.get('desc');
    const w = searchParams.get('wood');
    if (d) setDescription(d);
    if (w) setWoodType(w);
  }, [searchParams]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [estimate, setEstimate] = useState<any>(null);
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Entrega: recojo en taller o envío a domicilio con GPS + referencia
  const [entrega, setEntrega] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY');
  const [direccion, setDireccion] = useState('');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const pedirUbicacion = () => {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Tu dispositivo no permite obtener la ubicación. Escribe tu dirección abajo.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGpsError('No pudimos obtener tu ubicación. Escribe tu dirección abajo.');
        setGpsLoading(false);
      },
      { timeout: 10000 },
    );
  };

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : ''), [photo]);

  const calcular = async () => {
    setError('');
    setLoading(true);
    try {
      const imageBase64 = photo ? await api.photoBase64(photo) : undefined;
      setEstimate(await api.estimate(description, woodType.toUpperCase(), imageBase64));
      setPaso(3);
    } catch {
      setError('No pudimos calcular el precio. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const confirmar = async () => {
    setError('');
    setLoading(true);
    try {
      const photoUrl = photo ? (await api.uploadPhoto(photo)) ?? undefined : undefined;
      const q = await api.createQuotation({
        clientId: getSession()?.email ?? '',
        photoUrl,
        requestEstimate: true,
        delivery: entrega === 'PICKUP'
          ? { type: 'PICKUP' }
          : { type: 'DELIVERY', address: direccion.trim() || undefined, lat: gps?.lat, lng: gps?.lng },
        items: [{
          description,
          furnitureType: estimate?.furnitureType ?? 'OTHER',
          woodType: woodType.toUpperCase(),
          quantity: 1,
          unitPrice: estimate?.estimatedPrice ?? 0,
        }],
      });
      setQuotation(q);
    } catch {
      setError('No se pudo enviar la cotización. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const nombreMueble = MUEBLE[estimate?.furnitureType] ?? 'Mueble';

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Pide tu cotización</h1>
      <p style={s.sub}>Te ayudamos paso a paso. Solo toma un minuto.</p>

      {/* Progreso */}
      <div style={s.pasos}>
        {['Tu mueble', 'Madera y foto', 'Tu precio'].map((t, i) => {
          const n = i + 1;
          const hecho = paso > n || (n === 3 && !!estimate);
          const actual = paso === n;
          return (
            <div key={t} style={s.pasoWrap}>
              <span style={{ ...s.pasoNum, ...(hecho ? s.pasoOk : actual ? s.pasoActivo : {}) }}>
                {hecho ? <Icon name="check" size={14} /> : n}
              </span>
              <span style={{ ...s.pasoTexto, ...(actual ? { color: '#3B2F2F', fontWeight: 700 } : {}) }}>{t}</span>
              {n < 3 && <span style={s.pasoLinea} />}
            </div>
          );
        })}
      </div>

      {/* ══ PASO 1 — describir ══ */}
      {paso === 1 && (
        <div style={s.card}>
          <h2 style={s.h2}>¿Qué mueble quieres?</h2>
          <p style={s.help}>Cuéntanos con tus palabras. Si sabes las medidas, mejor; si no, no pasa nada.</p>
          <div style={s.chips}>
            {EJEMPLOS.map((e) => (
              <button key={e} type="button" style={s.chip} onClick={() => setDescription(e)}>{e}</button>
            ))}
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Ejemplo: un ropero de 3 puertas para el dormitorio…"
            style={s.textarea}
          />
          <button style={{ ...s.btn, opacity: description.trim() ? 1 : 0.5 }}
            disabled={!description.trim()}
            onClick={() => setPaso(2)}>
            Continuar <Icon name="arrow" size={16} />
          </button>
        </div>
      )}

      {/* ══ PASO 2 — madera + foto ══ */}
      {paso === 2 && (
        <div style={s.card}>
          <h2 style={s.h2}>Elige la madera</h2>
          <div style={s.maderas}>
            {WOODS.map((w) => {
              const sel = woodType === w.name.toUpperCase();
              const niv = NIVEL[w.factor];
              return (
                <button key={w.name} type="button" onClick={() => setWoodType(w.name.toUpperCase())}
                  style={{ ...s.madera, ...(sel ? s.maderaSel : {}) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <b style={{ fontSize: 16 }}>{w.name}</b>
                    {niv && <span style={{ ...s.nivel, background: niv.fondo, color: niv.color }}>{niv.texto}</span>}
                  </div>
                  <span style={s.maderaNota}>{w.note}</span>
                  {sel && <span style={s.maderaCheck}><Icon name="check" size={14} /></span>}
                </button>
              );
            })}
          </div>

          <h2 style={{ ...s.h2, marginTop: 20 }}>¿Tienes una foto de referencia? <span style={s.opcional}>opcional</span></h2>
          {preview ? (
            <div style={s.fotoBox}>
              <img src={preview} alt="Tu foto" style={s.foto} />
              <button type="button" style={s.fotoQuitar} onClick={() => setPhoto(null)}>Quitar foto</button>
            </div>
          ) : (
            <label style={s.fotoBtn}>
              <Icon name="package" size={22} />
              Toca aquí para subir una foto
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
            </label>
          )}

          {error && <p style={s.error}><Icon name="alert" size={14} /> {error}</p>}
          <div style={s.navBtns}>
            <button style={s.btnGhost} onClick={() => setPaso(1)}>Atrás</button>
            <button style={{ ...s.btn, flex: 1, opacity: woodType ? 1 : 0.5 }} disabled={!woodType || loading} onClick={calcular}>
              {loading ? 'Calculando precio…' : 'Calcular precio aproximado'}
            </button>
          </div>
        </div>
      )}

      {/* ══ PASO 3 — resultado ══ */}
      {paso === 3 && estimate && !quotation && (
        <div style={s.card}>
          <h2 style={s.h2}>Tu precio estimado</h2>
          <p style={s.help}>
            Detectamos un <b>{nombreMueble.toLowerCase()}</b> en madera <b>{WOODS.find(w => w.name.toUpperCase() === woodType)?.name ?? woodType}</b>:
          </p>
          <div style={s.precio}>{formatBs(estimate.estimatedPrice ?? 0)}</div>
          <p style={s.help}>
            <Icon name="info" size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
            Es un precio aproximado. El precio final lo confirma el taller contigo.
          </p>

          {/* ¿Cómo lo recibes? */}
          <h2 style={{ ...s.h2, marginTop: 18 }}>¿Cómo quieres recibir tu mueble?</h2>
          <div style={s.entregaGrid}>
            <button type="button" onClick={() => setEntrega('DELIVERY')}
              style={{ ...s.entregaCard, ...(entrega === 'DELIVERY' ? s.entregaSel : {}) }}>
              <span style={s.entregaIcon}><Icon name="truck" size={24} /></span>
              <b>Me lo traen a mi casa</b>
              <span style={s.entregaNota}>El taller te lo lleva hasta tu dirección</span>
            </button>
            <button type="button" onClick={() => setEntrega('PICKUP')}
              style={{ ...s.entregaCard, ...(entrega === 'PICKUP' ? s.entregaSel : {}) }}>
              <span style={s.entregaIcon}><Icon name="workshop" size={24} /></span>
              <b>Yo recojo en el taller</b>
              <span style={s.entregaNota}>Av. Banzer Km 6, Santa Cruz</span>
            </button>
          </div>

          {entrega === 'DELIVERY' && (
            <div style={s.gpsBox}>
              <button type="button" style={s.gpsBtn} onClick={pedirUbicacion} disabled={gpsLoading}>
                <Icon name="pin" size={18} />
                {gpsLoading ? 'Obteniendo tu ubicación…' : gps ? 'Ubicación guardada — volver a capturar' : 'Usar mi ubicación actual'}
              </button>
              {gps && (
                <p style={s.gpsOk}>
                  <Icon name="check" size={14} /> Ubicación lista — el repartidor llegará hasta tu casa.
                </p>
              )}
              {gpsError && <p style={s.error}><Icon name="alert" size={14} /> {gpsError}</p>}
              <label style={s.dirLabel}>
                Tu dirección o referencia
                <textarea value={direccion} onChange={(e) => setDireccion(e.target.value)} rows={2}
                  placeholder="Ej: Barrio Equipetrol, Calle Los Robles #45, portón verde"
                  style={{ ...s.textarea, marginBottom: 0 }} />
              </label>
              <p style={s.hintMini}>Ayúdanos a encontrarte: zona, calle, color de la casa…</p>
            </div>
          )}

          {error && <p style={s.error}><Icon name="alert" size={14} /> {error}</p>}
          <div style={s.navBtns}>
            <button style={s.btnGhost} onClick={() => setPaso(2)}>Atrás</button>
            <button style={{ ...s.btn, flex: 1 }} disabled={loading} onClick={confirmar}>
              {loading ? 'Enviando…' : 'Solicitar cotización'}
            </button>
          </div>
        </div>
      )}

      {/* ══ ÉXITO ══ */}
      {quotation && (
        <div style={{ ...s.card, textAlign: 'center', borderTop: '4px solid #27AE60' }}>
          <span style={s.okCircle}><Icon name="check" size={30} /></span>
          <h2 style={{ ...s.h2, textAlign: 'center' }}>¡Listo! Recibimos tu solicitud</h2>
          <p style={s.help}>
            El taller revisará tu mueble y te enviará el <b>precio final</b>.
            Cuando esté listo te avisamos en <b>Mis cotizaciones</b> para que decidas si aceptas.
          </p>
          <a href="/mis-cotizaciones" style={{ ...s.btn, textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            Ver mis cotizaciones <Icon name="arrow" size={16} />
          </a>
          <a href="/" style={{ ...s.btnGhost, textDecoration: 'none', display: 'block', marginTop: 10 }}>Volver al inicio</a>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 860, margin: '0 auto', padding: '26px 20px 60px' },
  h1: { margin: 0, fontSize: 26, color: '#3B2F2F', textAlign: 'center' },
  sub: { margin: '6px 0 22px', color: '#8a7f75', fontSize: 15, textAlign: 'center' },
  pasos: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 22 },
  pasoWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  pasoNum: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', background: '#EDE4D8', color: '#8a7f75', fontWeight: 800, fontSize: 14 },
  pasoOk: { background: '#27AE60', color: '#fff' },
  pasoActivo: { background: '#8B5A2B', color: '#fff' },
  pasoTexto: { fontSize: 13, color: '#8a7f75' },
  pasoLinea: { width: 28, height: 2, background: '#EDE4D8', margin: '0 2px' },
  card: { background: '#fff', borderRadius: 14, padding: '24px 22px', boxShadow: '0 1px 4px rgba(0,0,0,.08)', marginBottom: 16 },
  h2: { margin: '0 0 6px', fontSize: 19, color: '#3B2F2F' },
  help: { margin: '0 0 14px', color: '#6d6157', fontSize: 14, lineHeight: 1.5 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { background: '#F5F1EC', border: '1.5px solid #D4A574', color: '#6B4F2E', borderRadius: 999, padding: '9px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '13px 14px', borderRadius: 10, border: '1.5px solid #ddd4c8', fontSize: 15, fontFamily: 'inherit', resize: 'vertical', marginBottom: 14 },
  maderas: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 },
  madera: { position: 'relative', textAlign: 'left', background: '#FAF7F2', border: '2px solid #EDE4D8', borderRadius: 12, padding: '14px 14px 16px', cursor: 'pointer', fontFamily: 'inherit', color: '#3B2F2F' },
  maderaSel: { borderColor: '#8B5A2B', background: '#FDF6EE' },
  maderaNota: { display: 'block', marginTop: 6, fontSize: 12.5, color: '#8a7f75' },
  maderaCheck: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: '#8B5A2B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  nivel: { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999 },
  opcional: { fontSize: 12, color: '#8a7f75', fontWeight: 400 },
  fotoBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '22px 16px', border: '2px dashed #D4A574', borderRadius: 12, background: '#FDFBF8', color: '#8B5A2B', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  fotoBox: { display: 'flex', flexDirection: 'column', gap: 8 },
  foto: { width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12, border: '1px solid #EDE4D8' },
  fotoQuitar: { alignSelf: 'center', background: 'none', border: 'none', color: '#a33', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' },
  precio: { fontSize: 40, fontWeight: 800, color: '#8B5A2B', textAlign: 'center', margin: '10px 0' },
  entregaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 6 },
  entregaCard: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, textAlign: 'left', background: '#FAF7F2', border: '2px solid #EDE4D8', borderRadius: 12, padding: '16px 16px', cursor: 'pointer', fontFamily: 'inherit', color: '#3B2F2F' },
  entregaSel: { borderColor: '#8B5A2B', background: '#FDF6EE' },
  entregaIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 10, background: '#F0E7DC', color: '#8B5A2B' },
  entregaNota: { fontSize: 12.5, color: '#8a7f75' },
  gpsBox: { marginTop: 14, background: '#FAF7F2', borderRadius: 12, padding: '14px 14px', border: '1.5px dashed #D4A574', display: 'flex', flexDirection: 'column', gap: 10 },
  gpsBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1.5px solid #8B5A2B', color: '#8B5A2B', borderRadius: 10, padding: '13px 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' },
  gpsOk: { display: 'flex', alignItems: 'center', gap: 6, margin: 0, color: '#1E7B45', fontSize: 13, fontWeight: 600 },
  dirLabel: { fontSize: 13, fontWeight: 600, color: '#5c534a', display: 'flex', flexDirection: 'column', gap: 6 },
  hintMini: { margin: 0, color: '#b3a89c', fontSize: 12 },
  okCircle: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: '#E8F7EE', color: '#27AE60', marginBottom: 12 },
  navBtns: { display: 'flex', gap: 10, marginTop: 16 },
  btn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#8B5A2B', color: '#fff', border: 'none', padding: '14px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15, fontFamily: 'inherit' },
  btnGhost: { background: 'none', border: '1.5px solid #ddd4c8', color: '#5c534a', padding: '14px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 15, fontFamily: 'inherit', textAlign: 'center' },
  error: { display: 'flex', alignItems: 'center', gap: 6, margin: '10px 0 0', color: '#a33', fontSize: 13, background: '#fdf1f1', padding: '10px 12px', borderRadius: 8 },
};
