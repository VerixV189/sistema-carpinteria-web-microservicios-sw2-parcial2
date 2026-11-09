import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';
import { OfflineAiService, OfflineReportResult } from '../offline-ai.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px">
      <div>
        <h2 style="margin:0">Reportes Ejecutivos e Inteligencia de Negocio</h2>
        <p style="margin:4px 0 0;font-size:13px;color:#6b5e52">
          Genera reportes ejecutivos con consultas SQL seguras tanto Online como 100% Offline con IA Local.
        </p>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span
          style="padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700"
          [style.background]="isLocalMode ? '#fef3c7' : '#dcfce7'"
          [style.color]="isLocalMode ? '#92400e' : '#166534'"
          [style.border]="isLocalMode ? '1px solid #f59e0b' : '1px solid #86efac'"
        >
          {{ isLocalMode ? '⚡ Motor IA Local (Offline SQL Activo)' : '☁️ IA Servidor + Respaldo Local' }}
        </span>
        <button class="btn btn-ghost" (click)="toggleEngineMode()">
          {{ isLocalMode ? 'Intentar IA Servidor' : 'Forzar IA Local (Offline)' }}
        </button>
      </div>
    </div>

    <div class="card">
      <p style="margin-top:0;font-size:13px;color:#5c534a">
        Selecciona una consulta rápida o escribe cualquier pregunta sobre clientes, pedidos, stock, entregas, carpinteros o cotizaciones:
      </p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
        <button
          *ngFor="let p of presets"
          type="button"
          class="btn btn-ghost"
          style="font-size:12px;padding:6px 12px;border-radius:999px"
          (click)="runPreset(p)"
        >
          {{ p }}
        </button>
      </div>
      <div style="display:flex;gap:8px">
        <input
          [(ngModel)]="query"
          placeholder="Ej.: ¿Cuáles son los mejores clientes?, ¿Qué muebles tienen stock bajo?, ¿Qué pedidos están pendientes?..."
          style="flex:1"
          (keyup.enter)="ask()"
        />
        <button class="btn" (click)="ask()" [disabled]="loading">
          {{ loading ? 'Procesando...' : 'Generar Reporte' }}
        </button>
      </div>
      <div *ngIf="errorMsg" style="margin-top:10px;color:#b91c1c;font-size:13px;font-weight:600">
        {{ errorMsg }}
      </div>
    </div>

    <div *ngIf="loading" class="card" style="margin-top:12px">
      Generando consulta SQL segura y calculando métricas…
    </div>

    <div *ngIf="result" class="card" style="margin-top:12px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:12px">
        <div style="flex:1;min-width:260px">
          <div style="font-size:12px;font-weight:700;color:#8B5A2B;text-transform:uppercase;letter-spacing:.04em">
            Conclusión Ejecutiva IA
          </div>
          <p style="margin:6px 0;font-size:15px;line-height:1.5"><em>{{ result.narrative }}</em></p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280">
            <b>Fuente:</b> {{ result.source }}
            <span *ngIf="result.stats"> · {{ result.stats }}</span>
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" (click)="exportPdf()" title="Generar documento PDF listo para imprimir o guardar sin internet">
            📄 Descargar / Imprimir PDF
          </button>
          <button class="btn btn-ghost" (click)="exportCsv()" title="Descargar tabla y conclusión en formato CSV compatible con Excel">
            📊 Exportar Excel (CSV)
          </button>
        </div>
      </div>

      <div style="background:#f8f6f2;border:1px solid #e6dfd5;border-radius:8px;padding:10px 12px;margin-bottom:14px;font-size:12px">
        <b style="color:#5c534a">SQL Validado (Solo Lectura Anti-Inyección):</b>
        <code style="display:block;margin-top:4px;color:#1f2937;word-break:break-all">{{ result.sql }}</code>
      </div>

      <div style="overflow-x:auto" *ngIf="result.rows?.length">
        <table>
          <thead>
            <tr>
              <th *ngFor="let k of keys(result.rows[0])">{{ k }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of result.rows">
              <td *ngFor="let k of keys(row)">{{ row[k] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p *ngIf="!result.rows?.length" style="color:#8a7f75;font-size:13px">
        La consulta no devolvió filas.
      </p>
    </div>
  `,
})
export class ReportsComponent {
  query = '';
  loading = false;
  useLocalEngine = false;
  errorMsg = '';
  result: OfflineReportResult | null = null;

  presets = [
    '¿Cuáles son los mejores clientes y cuánto facturaron?',
    '¿Qué pedidos están pendientes o en producción?',
    '¿Qué muebles tienen stock bajo en el Marketplace?',
    '¿Cuáles son las entregas programadas?',
    '¿Cuál es la carga de trabajo de los carpinteros?',
    'Resumen de cotizaciones registradas',
  ];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    public offlineAi: OfflineAiService,
  ) {}

  get isLocalMode(): boolean {
    return this.offlineAi.offline() || this.useLocalEngine;
  }

  toggleEngineMode(): void {
    if (this.isLocalMode) {
      this.useLocalEngine = false;
      if (this.offlineAi.isForceOffline()) {
        this.offlineAi.toggleForceOffline();
      }
      this.offlineAi.markNetworkSuccess();
    } else {
      this.useLocalEngine = true;
    }
  }

  runPreset(presetText: string): void {
    this.query = presetText;
    this.ask();
  }

  ask(): void {
    if (!this.query.trim()) return;
    this.loading = true;
    this.errorMsg = '';

    // Si estamos sin internet o con el motor IA Local activado, resolvemos 100% en el frontend
    if (this.isLocalMode) {
      try {
        this.result = this.offlineAi.generateOfflineReport(this.query);
      } catch (e) {
        this.errorMsg = (e as Error).message;
      } finally {
        this.loading = false;
      }
      return;
    }

    const token = this.auth.token() ?? '';
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});

    this.http.post<OfflineReportResult>(`${environment.aiApiUrl}/ai/report`, { query: this.query }, { headers })
      .subscribe({
        next: (r) => {
          this.offlineAi.markNetworkSuccess();
          if (r && r.rows && r.rows.length > 0) {
            this.result = {
              ...r,
              source: r.source === 'llm'
                ? 'Ollama LLM (Text-to-SQL en Servidor PostgreSQL)'
                : r.source === 'template'
                  ? 'Servidor PostgreSQL + Narrativa IA (Ollama)'
                  : r.source,
            };
          } else {
            // Si el backend no devolvió filas o falló internamente, enriquecemos con el motor IA Local
            this.result = this.offlineAi.generateOfflineReport(this.query);
          }
          this.loading = false;
        },
        error: (err) => {
          if (!err?.status || err.status === 0) {
            this.offlineAi.markNetworkFailure();
          }
          try {
            this.result = this.offlineAi.generateOfflineReport(this.query);
          } catch (e) {
            this.errorMsg = (e as Error).message;
          }
          this.loading = false;
        },
      });
  }

  exportPdf(): void {
    if (!this.result) return;
    this.offlineAi.exportReportToPdf(this.result, this.query || 'Reporte General');
  }

  exportCsv(): void {
    if (!this.result) return;
    this.offlineAi.exportReportToCsv(this.result, this.query || 'Reporte General');
  }

  keys(row: Record<string, any>): string[] {
    return Object.keys(row);
  }
}
