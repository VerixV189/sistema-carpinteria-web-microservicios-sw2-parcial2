import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { getSession } from '../auth';
import { Icon } from '../icons';

interface Msg { role: 'user' | 'agent'; text: string }

const PREGUNTAS = [
  'Quiero cotizar un mueble',
  '¿En qué va mi pedido?',
  '¿Cuándo llega mi entrega?',
];

/** Asistente IA del portal — panel acoplado a la derecha (empuja el contenido,
 *  no lo tapa). Solo para usuarios autenticados; el rol limita las herramientas
 *  en el backend: CLIENT ve solo sus pedidos/cotizaciones. */
export default function AgentChat({ open, onToggle }: { open: boolean; onToggle: (v: boolean) => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'agent', text: 'Hola, soy el asistente de El Roble. Toca una pregunta o escríbeme tu duda.' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const sessionId = useRef(`web-${Math.random().toString(36).slice(2, 10)}`);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  const send = async (pregunta?: string) => {
    const text = (pregunta ?? input).trim();
    if (!text || busy) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text }]);
    setBusy(true);
    try {
      const r = await api.agent(text, sessionId.current);
      setMsgs((m) => [...m, { role: 'agent', text: r.answer ?? 'Sin respuesta.' }]);
    } catch {
      setMsgs((m) => [...m, { role: 'agent', text: 'No pude contactar al asistente. Intenta de nuevo.' }]);
    } finally {
      setBusy(false);
    }
  };

  if (!getSession()) return null;

  return (
    <>
      {!open && (
        <button onClick={() => onToggle(true)} style={s.fab} aria-label="Asistente">
          <Icon name="chat" size={22} />
          <span>Ayuda</span>
        </button>
      )}
      {open && (
        <>
          <div style={s.fondo} onClick={() => onToggle(false)} className="chat-fondo" aria-hidden="true" />
          <aside style={s.panel} role="dialog" aria-label="Asistente">
            <div style={s.head}>
              <span style={s.headIco}><Icon name="chat" size={18} /></span>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 15 }}>Asistente El Roble</b>
                <p style={{ margin: '1px 0 0', fontSize: 12, color: '#8a7f75' }}>Pregúntame lo que necesites</p>
              </div>
              <button onClick={() => onToggle(false)} style={s.close} aria-label="Cerrar">✕</button>
            </div>
            <div style={s.chips}>
              {PREGUNTAS.map((q) => (
                <button key={q} style={s.chip} onClick={() => send(q)} disabled={busy}>{q}</button>
              ))}
            </div>
            <div style={s.body}>
              {msgs.map((m, i) => (
                <div key={i} style={{ ...s.msg, ...(m.role === 'user' ? s.userMsg : s.agentMsg) }}>
                  {m.text}
                </div>
              ))}
              {busy && <div style={{ ...s.msg, ...s.agentMsg, opacity: 0.6 }}>Escribiendo…</div>}
              <div ref={bottom} />
            </div>
            <div style={s.foot}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Escribe tu duda aquí…"
                style={s.input}
              />
              <button onClick={() => send()} disabled={busy || !input.trim()} style={s.sendBtn}>
                Preguntar
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  fab: {
    position: 'fixed', right: 22, bottom: 22, height: 54, padding: '0 20px', borderRadius: 999,
    background: '#8B5A2B', color: '#FAF7F2', border: 'none', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700,
    fontFamily: 'inherit', boxShadow: '0 6px 18px rgba(59,47,47,.4)', zIndex: 900,
  },
  fondo: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 850 },
  panel: {
    position: 'fixed', top: 64, right: 0, height: 'calc(100dvh - 64px)',
    width: 'min(400px, 100vw)', boxSizing: 'border-box',
    background: '#FAF7F2', zIndex: 860, display: 'flex', flexDirection: 'column',
    padding: 16, borderLeft: '1px solid #EDE4D8', boxShadow: '-8px 0 30px rgba(0,0,0,.12)',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  head: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexShrink: 0, color: '#3B2F2F' },
  headIco: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 12, background: '#8B5A2B', color: '#FAF7F2' },
  close: { border: 'none', background: '#EDE4D8', color: '#3B2F2F', width: 36, height: 36, borderRadius: '50%', fontSize: 15, cursor: 'pointer' },
  chips: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 10, flexShrink: 0 },
  chip: { background: '#fff', border: '1.5px solid #D4A574', color: '#6B4F2E', borderRadius: 999, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  body: { flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: '#fff', borderRadius: 12, border: '1px solid #EDE4D8' },
  msg: { maxWidth: '85%', padding: '10px 14px', borderRadius: 14, fontSize: 14, lineHeight: 1.45, whiteSpace: 'pre-wrap' },
  agentMsg: { background: '#F5F1EC', color: '#3B2F2F', alignSelf: 'flex-start', border: '1px solid #EDE4D8' },
  userMsg: { background: '#8B5A2B', color: '#FAF7F2', alignSelf: 'flex-end' },
  foot: { display: 'flex', gap: 8, paddingTop: 10, marginTop: 10, borderTop: '1px solid #EDE4D8', flexShrink: 0 },
  input: { flex: 1, minWidth: 0, border: '1.5px solid #ddd4c8', borderRadius: 10, padding: '11px 14px', fontSize: 14, fontFamily: 'inherit' },
  sendBtn: { background: '#8B5A2B', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' },
};
