import { Component, ElementRef, ViewChild, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

interface Msg { role: 'user' | 'agent'; text: string; }

const PREGUNTAS = [
  '¿Cuántos pedidos hay pendientes?',
  '¿Qué entregas hay esta semana?',
  'Dame un resumen del negocio de hoy',
];

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (!open()) {
      <button class="fab" (click)="open.set(true)" aria-label="Abrir asistente">
        <svg viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>
        <span>Asistente</span>
      </button>
    } @else {
      <div class="chat-fondo" (click)="open.set(false)"></div>
      <aside class="panel" role="dialog" aria-label="Asistente del negocio">
        <div class="panel-top">
          <div class="panel-title">
            <span class="panel-ico">
              <svg viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>
            </span>
            <div><b>Asistente</b><p>Pregúntame sobre el negocio</p></div>
          </div>
          <button class="x" (click)="open.set(false)" aria-label="Cerrar">✕</button>
        </div>

        <div class="chips">
          @for (q of preguntas; track q) {
            <button class="chip" (click)="send(q)" [disabled]="loading">{{ q }}</button>
          }
        </div>

        <div class="msgs" #caja>
          @for (m of msgs; track $index) {
            <div class="b" [class.bu]="m.role === 'user'" [class.ba]="m.role === 'agent'">{{ m.text }}</div>
          }
          @if (loading) { <div class="b ba" style="opacity:.6">Pensando…</div> }
        </div>

        <form class="prow" (ngSubmit)="send()">
          <input [(ngModel)]="input" name="q" placeholder="Escribe tu pregunta…" autocomplete="off" />
          <button type="submit" [disabled]="loading || !input.trim()">Preguntar</button>
        </form>
      </aside>
    }
  `,
  styles: [`
    .fab { position: fixed; bottom: 22px; right: 22px; height: 52px; padding: 0 20px; border-radius: 999px; background: #8B5A2B; border: none; cursor: pointer; box-shadow: 0 6px 18px rgba(59,47,47,.4); z-index: 900; display: inline-flex; align-items: center; gap: 8px; color: #FAF7F2; font-size: 15px; font-weight: 700; font-family: Inter, system-ui, sans-serif; transition: background .2s, transform .15s; }
    .fab:hover { background: #6B4F2E; transform: translateY(-2px); }
    .fab svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .chat-fondo { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.3); z-index: 850; }

    .panel { position: fixed; top: 0; right: 0; height: 100dvh; width: min(400px, 92vw); box-sizing: border-box; background: #FAF7F2; z-index: 860; display: flex; flex-direction: column; padding: 16px; border-left: 1px solid #EDE4D8; box-shadow: -8px 0 30px rgba(0,0,0,.12); animation: entrar .25s ease-out; overflow: hidden; font-family: Inter, system-ui, sans-serif; }
    @keyframes entrar { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .panel-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; }
    .panel-title { display: flex; align-items: center; gap: 10px; color: #3B2F2F; font-size: 16px; }
    .panel-ico { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 12px; background: #8B5A2B; color: #FAF7F2; }
    .panel-ico svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .panel-title p { margin: 2px 0 0; font-size: 12px; color: #8a7f75; font-weight: 400; }
    .x { border: none; background: #EDE4D8; color: #3B2F2F; width: 36px; height: 36px; border-radius: 50%; font-size: 15px; cursor: pointer; }

    .chips { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 10px; flex-shrink: 0; }
    .chip { background: #fff; border: 1.5px solid #D4A574; color: #6B4F2E; border-radius: 999px; padding: 8px 14px; font-size: 13px; cursor: pointer; text-align: left; }
    .chip:disabled { opacity: .5; }

    .msgs { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; background: #fff; border-radius: 12px; border: 1px solid #EDE4D8; }
    .b { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.45; white-space: pre-wrap; }
    .ba { background: #F5F1EC; color: #3B2F2F; align-self: flex-start; border: 1px solid #EDE4D8; }
    .bu { background: #8B5A2B; color: #FAF7F2; align-self: flex-end; }
    .prow { display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid #EDE4D8; flex-shrink: 0; margin-top: 10px; padding-bottom: env(safe-area-inset-bottom, 0px); }
    .prow input { flex: 1; padding: 11px 14px; border: 1.5px solid #ddd; border-radius: 10px; font-size: 14px; min-width: 0; }
    .prow button { background: #8B5A2B; color: #fff; border: none; border-radius: 10px; padding: 11px 18px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .prow button:disabled { opacity: .5; }

    @media (max-width: 940px) {
      .chat-fondo { display: block; }
    }
    @media (max-width: 640px) {
      .panel { width: 100vw; }
      .fab { right: 14px; bottom: calc(14px + env(safe-area-inset-bottom, 0px)); }
    }
  `],
})
export class AgentChatComponent {
  open = model(false);
  input = '';
  loading = false;
  preguntas = PREGUNTAS;
  msgs: Msg[] = [
    { role: 'agent', text: 'Hola. Puedo consultar pedidos, clientes, inventario y generar reportes del negocio.' },
  ];
  private sessionId = crypto.randomUUID();

  @ViewChild('caja') msgsBox?: ElementRef<HTMLDivElement>;

  constructor(private auth: AuthService) {}

  async send(pregunta?: string) {
    const text = (pregunta ?? this.input).trim();
    if (!text || this.loading) return;
    this.input = '';
    this.msgs.push({ role: 'user', text });
    this.loading = true;
    try {
      const r = await fetch('http://localhost:3000/api/ai/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.auth.session()?.token ?? ''}`,
        },
        body: JSON.stringify({ query: text, session_id: this.sessionId }),
      });
      const d = await r.json();
      this.msgs.push({ role: 'agent', text: d.answer ?? 'Sin respuesta.' });
    } catch {
      this.msgs.push({ role: 'agent', text: 'El asistente no está disponible.' });
    } finally {
      this.loading = false;
    }
    setTimeout(() => this.msgsBox?.nativeElement.scrollTo({ top: this.msgsBox.nativeElement.scrollHeight, behavior: 'smooth' }), 50);
  }
}
