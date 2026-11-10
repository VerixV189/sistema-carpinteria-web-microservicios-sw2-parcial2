import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';
import { ApiService } from '../api.service';
import { CLIENTS, ORDERS, CARPENTERS, DELIVERIES } from '../graphql.operations';
import { OfflineAiService, OfflineReportResult } from '../offline-ai.service';

export type ChartType = 'bar' | 'pie' | 'line' | 'category';

export interface ChartPoint {
  label: string;
  sublabel?: string;
  value: number;
  pctOfMax: number;
  pctOfTotal: number;
  color: string;
}

export interface PieSlice extends ChartPoint {
  dashArray: string;
  dashOffset: number;
}

const PALETTE = [
  '#8B5A2B',
  '#C48A47',
  '#2E6F40',
  '#1D5AA8',
  '#7C3AED',
  '#D97706',
  '#0D9488',
  '#B91C1C',
  '#4F46E5',
  '#6D4C41',
];

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rep-head">
      <div>
        <h2 style="margin:0;color:#3B2F2F">Reportes Ejecutivos e Inteligencia de Negocio</h2>
        <p style="margin:4px 0 0;font-size:13px;color:#6b5e52">
          Consultas en lenguaje natural con validación SQL, métricas ejecutivas y gráficas interactivas (Barras, Torta, Líneas y Segmentos).
        </p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span
          style="padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700"
          [style.background]="isLocalMode ? '#fef3c7' : '#dcfce7'"
          [style.color]="isLocalMode ? '#92400e' : '#166534'"
          [style.border]="isLocalMode ? '1px solid #f59e0b' : '1px solid #86efac'"
        >
          {{ isLocalMode ? '⚡ Motor Analítico Local Activo' : '☁️ Datos Sincronizados en Tiempo Real' }}
        </span>
        <button class="btn btn-ghost btn-sm" (click)="syncLiveData(true)" [disabled]="syncing">
          {{ syncing ? 'Sincronizando…' : '🔄 Sincronizar Datos' }}
        </button>
        <button class="btn btn-ghost btn-sm" (click)="toggleEngineMode()">
          {{ isLocalMode ? 'Usar Modo En Línea' : 'Modo Sin Conexión' }}
        </button>
      </div>
    </div>

    <div class="card">
      <p style="margin-top:0;font-size:13px;color:#5c534a">
        Selecciona un reporte ejecutivo rápido o escribe tu propia consulta sobre clientes, pedidos, inventario, entregas, carpinteros o cotizaciones:
      </p>
      <div class="preset-wrap">
        <button
          *ngFor="let p of presets"
          type="button"
          class="preset-chip"
          [class.active]="query === p"
          (click)="runPreset(p)"
        >
          {{ p }}
        </button>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <div class="input-voice-wrap" style="flex:1;min-width:240px;display:flex;align-items:center;gap:6px;position:relative">
          <input
            [(ngModel)]="query"
            [placeholder]="isListening ? '🎙️ Escuchando tu voz... habla ahora' : 'Ej.: ¿Cuáles son los mejores clientes?, ¿Qué muebles tienen stock bajo en la tienda?...'"
            style="flex:1;width:100%"
            [style.border-color]="isListening ? '#dc2626' : ''"
            [style.box-shadow]="isListening ? '0 0 0 3px rgba(220,38,38,.15)' : ''"
            (keyup.enter)="ask()"
          />
        </div>
        <button
          type="button"
          class="btn-voice"
          [class.listening]="isListening"
          (click)="toggleVoiceInput()"
          [title]="isListening ? 'Detener dictado por voz' : 'Dictar consulta de reporte con tu voz'"
        >
          <span class="mic-dot" *ngIf="isListening"></span>
          {{ isListening ? '⏹️ Detener Voz' : '🎙️ Dictar con Voz' }}
        </button>
        <button class="btn" (click)="ask()" [disabled]="loading">
          {{ loading ? 'Generando reporte…' : 'Generar Reporte' }}
        </button>
      </div>
      <div *ngIf="isListening || voiceStatus" class="voice-banner" [class.active]="isListening">
        <span>{{ isListening ? '🎙️ Escuchando en español: di por ejemplo "Muéstrame los mejores clientes" o "Pedidos en producción"...' : voiceStatus }}</span>
      </div>
      <div *ngIf="errorMsg" style="margin-top:10px;color:#b91c1c;font-size:13px;font-weight:600">
        {{ errorMsg }}
      </div>
    </div>

    <div *ngIf="loading" class="card" style="margin-top:12px">
      Sincronizando registros, ejecutando consulta SQL segura y generando gráficas ejecutivas…
    </div>

    <ng-container *ngIf="result && !loading">
      <!-- Conclusión Ejecutiva + Botones de Exportación -->
      <div class="card" style="margin-top:12px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:12px">
          <div style="flex:1;min-width:260px">
            <div style="font-size:12px;font-weight:700;color:#8B5A2B;text-transform:uppercase;letter-spacing:.04em">
              Conclusión Ejecutiva IA
            </div>
            <p style="margin:6px 0;font-size:15px;line-height:1.5;color:#2b2118"><em>{{ result.narrative }}</em></p>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280">
              <b>Fuente:</b> {{ result.source }}
              <span *ngIf="result.stats"> · {{ result.stats }}</span>
            </p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-ghost" (click)="toggleSpeakNarrative()" title="Escuchar conclusión ejecutiva narrada por voz">
              {{ isSpeaking ? '⏹️ Detener Lectura' : '🔊 Escuchar Conclusión' }}
            </button>
            <button class="btn" (click)="exportPdf()" title="Generar reporte ejecutivo en PDF con gráficas listo para imprimir">
              📄 Descargar / Imprimir PDF
            </button>
            <button class="btn btn-ghost" (click)="exportCsv()" title="Descargar tabla y métricas en formato CSV para Excel">
              📊 Exportar Excel (CSV)
            </button>
          </div>
        </div>

        <div class="sql-box">
          <b style="color:#5c534a">SQL Validado (Solo Lectura Anti-Inyección):</b>
          <code>{{ result.sql }}</code>
        </div>
      </div>

      <!-- Tarjetas KPI Ejecutivas -->
      <div class="kpi-row" *ngIf="chartPoints.length">
        <div class="kpi-card">
          <span class="kpi-lbl">Total {{ cleanCol(selectedMetric) }}</span>
          <strong class="kpi-val">{{ isCurrencyMetric(selectedMetric) ? 'Bs ' : '' }}{{ fmtNum(kpiTotal) }}</strong>
          <span class="kpi-sub">Suma acumulada del reporte</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-lbl">Promedio por Registro</span>
          <strong class="kpi-val">{{ isCurrencyMetric(selectedMetric) ? 'Bs ' : '' }}{{ fmtNum(kpiAvg) }}</strong>
          <span class="kpi-sub">Media sobre {{ result.rows.length }} registros</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-lbl">Líder / Mayor Valor</span>
          <strong class="kpi-val" style="font-size:17px">{{ kpiTopLabel }}</strong>
          <span class="kpi-sub">{{ isCurrencyMetric(selectedMetric) ? 'Bs ' : '' }}{{ fmtNum(kpiMax) }} ({{ kpiTopShare }}% del total)</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-lbl">Registros con Actividad</span>
          <strong class="kpi-val">{{ activeCount }} / {{ result.rows.length }}</strong>
          <span class="kpi-sub">{{ activePct }}% con valor mayor a cero</span>
        </div>
      </div>

      <!-- Panel de Gráficas Interactivas -->
      <div class="card" style="margin-top:12px" *ngIf="chartPoints.length">
        <div class="chart-toolbar">
          <div>
            <h3 style="margin:0;font-size:16px;color:#3B2F2F">Visualización Gráfica Interactiva</h3>
            <span style="font-size:12px;color:#8a7f75">
              Analizando <b>{{ cleanCol(selectedMetric) }}</b> por <b>{{ cleanCol(labelColumn) }}</b>
            </span>
          </div>

          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <!-- Selector de Métrica si hay más de 1 columna numérica -->
            <label *ngIf="numericColumns.length > 1" style="display:flex;align-items:center;gap:6px;font-size:12px;color:#5c534a;font-weight:600">
              Métrica:
              <select [(ngModel)]="selectedMetric" (ngModelChange)="rebuildCharts()" style="padding:5px 10px;border-radius:8px;border:1px solid #d6cbbd;font-size:12px">
                <option *ngFor="let m of numericColumns" [value]="m">{{ cleanCol(m) }}</option>
              </select>
            </label>

            <!-- Selector de Tipo de Gráfica -->
            <div class="chart-tabs">
              <button type="button" [class.active]="chartType === 'bar'" (click)="chartType = 'bar'">📊 Barras</button>
              <button type="button" [class.active]="chartType === 'pie'" (click)="chartType = 'pie'">🥧 Torta / Anillo</button>
              <button type="button" [class.active]="chartType === 'line'" (click)="chartType = 'line'">📈 Líneas y Tendencia</button>
              <button type="button" *ngIf="categoryPoints.length" [class.active]="chartType === 'category'" (click)="chartType = 'category'">🗂️ Por Categoría</button>
            </div>
          </div>
        </div>

        <!-- 1. GRÁFICA DE BARRAS (Horizontal + Columnas Verticales) -->
        <div *ngIf="chartType === 'bar'" class="bar-layout">
          <div>
            <div class="sub-chart-title">Ranking Comparativo ({{ cleanCol(selectedMetric) }})</div>
            <div class="hbar-row" *ngFor="let pt of chartPoints; let i = index">
              <div class="hbar-lbl" [title]="pt.label">
                <span class="rank-badge">{{ i + 1 }}</span>
                <div>
                  <div style="font-weight:600;color:#2b2118">{{ pt.label }}</div>
                  <div *ngIf="pt.sublabel" style="font-size:11px;color:#8a7f75">{{ pt.sublabel }}</div>
                </div>
              </div>
              <div class="hbar-track">
                <div
                  class="hbar-fill"
                  [style.width.%]="pt.value > 0 ? Math.max(pt.pctOfMax, 3) : 0"
                  [style.background]="pt.color"
                ></div>
              </div>
              <div class="hbar-val">
                <strong>{{ isCurrencyMetric(selectedMetric) ? 'Bs ' : '' }}{{ fmtNum(pt.value) }}</strong>
                <span class="pct-pill">{{ pt.pctOfTotal }}%</span>
              </div>
            </div>
          </div>

          <!-- Columnas verticales -->
          <div class="vbar-box">
            <div class="sub-chart-title">Columnas Verticales (Top {{ Math.min(chartPoints.length, 8) }})</div>
            <div class="vbar-stage">
              <div class="vbar-col" *ngFor="let pt of chartPoints.slice(0, 8)">
                <div class="vbar-top-val">{{ fmtShort(pt.value) }}</div>
                <div class="vbar-rail">
                  <div
                    class="vbar-pillar"
                    [style.height.%]="pt.value > 0 ? Math.max(pt.pctOfMax, 4) : 2"
                    [style.background]="pt.color"
                  ></div>
                </div>
                <div class="vbar-name" [title]="pt.label">{{ shortLabel(pt.label) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. GRÁFICA DE TORTA / ANILLO (Donut SVG + Leyenda Porcentual) -->
        <div *ngIf="chartType === 'pie'" class="pie-layout">
          <div class="pie-svg-wrap">
            <svg viewBox="0 0 220 220" class="donut-svg">
              <circle cx="110" cy="110" r="78" fill="none" stroke="#f0eae1" stroke-width="34"></circle>
              <circle
                *ngFor="let s of pieSlices"
                cx="110"
                cy="110"
                r="78"
                fill="none"
                [attr.stroke]="s.color"
                stroke-width="34"
                [attr.stroke-dasharray]="s.dashArray"
                [attr.stroke-dashoffset]="s.dashOffset"
                transform="rotate(-90 110 110)"
              >
                <title>{{ s.label }}: {{ fmtNum(s.value) }} ({{ s.pctOfTotal }}%)</title>
              </circle>
              <text x="110" y="103" text-anchor="middle" class="donut-center-lbl">TOTAL</text>
              <text x="110" y="124" text-anchor="middle" class="donut-center-val">
                {{ isCurrencyMetric(selectedMetric) ? 'Bs ' : '' }}{{ fmtShort(kpiTotal) }}
              </text>
            </svg>
          </div>
          <div class="pie-legend">
            <div class="sub-chart-title">Distribución Porcentual ({{ cleanCol(selectedMetric) }})</div>
            <div class="legend-item" *ngFor="let s of pieSlices">
              <span class="legend-dot" [style.background]="s.color"></span>
              <span class="legend-name">{{ s.label }}</span>
              <span class="legend-val">{{ isCurrencyMetric(selectedMetric) ? 'Bs ' : '' }}{{ fmtNum(s.value) }}</span>
              <span class="pct-pill">{{ s.pctOfTotal }}%</span>
            </div>
          </div>
        </div>

        <!-- 3. GRÁFICA DE LÍNEAS Y ÁREA (Tendencia SVG) -->
        <div *ngIf="chartType === 'line'" class="line-layout">
          <div class="sub-chart-title">Curva de Comportamiento y Magnitud ({{ cleanCol(selectedMetric) }})</div>
          <svg viewBox="0 0 760 260" class="line-svg">
            <defs>
              <linearGradient id="robleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#8B5A2B" stop-opacity="0.38" />
                <stop offset="100%" stop-color="#8B5A2B" stop-opacity="0.02" />
              </linearGradient>
            </defs>
            <!-- Líneas guía horizontales -->
            <line x1="55" y1="30" x2="730" y2="30" stroke="#ece4d8" stroke-dasharray="4 4" />
            <line x1="55" y1="100" x2="730" y2="100" stroke="#ece4d8" stroke-dasharray="4 4" />
            <line x1="55" y1="170" x2="730" y2="170" stroke="#ece4d8" stroke-dasharray="4 4" />
            <line x1="55" y1="210" x2="730" y2="210" stroke="#cbbba8" stroke-width="1.5" />

            <!-- Etiquetas eje Y -->
            <text x="48" y="34" text-anchor="end" font-size="10" fill="#8a7f75">{{ fmtShort(kpiMax) }}</text>
            <text x="48" y="104" text-anchor="end" font-size="10" fill="#8a7f75">{{ fmtShort(kpiMax * 0.6) }}</text>
            <text x="48" y="174" text-anchor="end" font-size="10" fill="#8a7f75">{{ fmtShort(kpiMax * 0.25) }}</text>
            <text x="48" y="214" text-anchor="end" font-size="10" fill="#8a7f75">0</text>

            <!-- Polígono de área y polilínea -->
            <polygon *ngIf="lineAreaPoints" [attr.points]="lineAreaPoints" fill="url(#robleAreaGrad)" />
            <polyline
              *ngIf="linePathPoints"
              [attr.points]="linePathPoints"
              fill="none"
              stroke="#8B5A2B"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Puntos interactivos -->
            <g *ngFor="let p of lineCoords">
              <circle [attr.cx]="p.x" [attr.cy]="p.y" r="5.5" fill="#fff" stroke="#8B5A2B" stroke-width="3">
                <title>{{ p.label }}: {{ fmtNum(p.value) }}</title>
              </circle>
              <text [attr.x]="p.x" [attr.y]="p.y - 10" text-anchor="middle" font-size="10" font-weight="700" fill="#3B2F2F">
                {{ fmtShort(p.value) }}
              </text>
              <text [attr.x]="p.x" y="232" text-anchor="middle" font-size="10" fill="#5c534a">
                {{ shortLabel(p.label) }}
              </text>
            </g>
          </svg>
        </div>

        <!-- 4. GRÁFICA POR CATEGORÍA / SEGMENTO / ESTADO -->
        <div *ngIf="chartType === 'category'" class="cat-layout">
          <div class="sub-chart-title">Agrupación por {{ cleanCol(categoryColumn) }}</div>
          <div class="cat-grid">
            <div class="cat-card" *ngFor="let c of categoryPoints">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <span style="font-weight:700;color:#3B2F2F">{{ c.label }}</span>
                <span class="pct-pill">{{ c.pctOfTotal }}%</span>
              </div>
              <div style="font-size:20px;font-weight:800;color:#8B5A2B;margin-bottom:4px">
                {{ isCurrencyMetric(selectedMetric) ? 'Bs ' : '' }}{{ fmtNum(c.value) }}
              </div>
              <div style="font-size:12px;color:#6b5e52;margin-bottom:8px">{{ c.sublabel }}</div>
              <div class="hbar-track">
                <div class="hbar-fill" [style.width.%]="Math.max(c.pctOfMax, 4)" [style.background]="c.color"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla Detallada de Resultados -->
      <div class="card" style="margin-top:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <h3 style="margin:0;font-size:15px;color:#3B2F2F">Detalle Tabular de Registros ({{ result.rows.length }})</h3>
        </div>
        <div style="overflow-x:auto" *ngIf="result.rows?.length">
          <table>
            <thead>
              <tr>
                <th *ngFor="let k of keys(result.rows[0])">{{ cleanCol(k) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of result.rows">
                <td *ngFor="let k of keys(row)">
                  <ng-container *ngIf="isBadgeCol(k); else plainCell">
                    <span class="rep-badge">{{ row[k] }}</span>
                  </ng-container>
                  <ng-template #plainCell>
                    {{ formatCell(k, row[k]) }}
                  </ng-template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p *ngIf="!result.rows?.length" style="color:#8a7f75;font-size:13px">
          La consulta no devolvió filas.
        </p>
      </div>
    </ng-container>
  `,
  styles: [`
    .rep-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; }
    .preset-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .preset-chip {
      background: #FAF7F2; border: 1px solid #d8ccbc; color: #4a3c31;
      font-size: 12px; font-weight: 600; padding: 7px 13px; border-radius: 999px; cursor: pointer;
      transition: all .15s ease;
    }
    .preset-chip:hover { border-color: #8B5A2B; color: #8B5A2B; }
    .preset-chip.active { background: #8B5A2B; color: #fff; border-color: #8B5A2B; }
    .sql-box { background: #f8f6f2; border: 1px solid #e6dfd5; border-radius: 8px; padding: 10px 12px; font-size: 12px; }
    .sql-box code { display: block; margin-top: 4px; color: #1f2937; word-break: break-all; }

    .kpi-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px; margin-top: 12px;
    }
    .kpi-card {
      background: #fff; border: 1px solid #ede4d8; border-radius: 12px;
      padding: 14px 16px; display: flex; flex-direction: column; gap: 4px;
      box-shadow: 0 2px 8px rgba(59,47,47,.04);
    }
    .kpi-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #8a7f75; font-weight: 700; }
    .kpi-val { font-size: 22px; color: #8B5A2B; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .kpi-sub { font-size: 12px; color: #6b5e52; }

    .chart-toolbar {
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 12px; margin-bottom: 16px; padding-bottom: 12px;
      border-bottom: 1px solid #f0e8dd;
    }
    .chart-tabs {
      display: inline-flex; background: #f5efe6; padding: 3px; border-radius: 10px; gap: 4px; flex-wrap: wrap;
    }
    .chart-tabs button {
      border: none; background: transparent; color: #5c534a; font-size: 12px; font-weight: 600;
      padding: 6px 12px; border-radius: 8px; cursor: pointer;
    }
    .chart-tabs button.active {
      background: #8B5A2B; color: #fff; box-shadow: 0 2px 6px rgba(139,90,43,.25);
    }
    .sub-chart-title { font-size: 12px; font-weight: 700; color: #6b5e52; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 12px; }

    .bar-layout { display: grid; grid-template-columns: 1.35fr 1fr; gap: 22px; align-items: start; }
    @media (max-width: 960px) { .bar-layout { grid-template-columns: 1fr; } }

    .hbar-row { display: grid; grid-template-columns: minmax(140px, 210px) 1fr minmax(95px, 130px); align-items: center; gap: 10px; margin-bottom: 10px; font-size: 13px; }
    .hbar-lbl { display: flex; align-items: center; gap: 8px; overflow: hidden; }
    .rank-badge {
      width: 20px; height: 20px; border-radius: 6px; background: #f2ebe1; color: #8B5A2B;
      display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0;
    }
    .hbar-track { height: 14px; background: #f2ebe1; border-radius: 999px; overflow: hidden; }
    .hbar-fill { height: 100%; border-radius: 999px; transition: width .35s ease; }
    .hbar-val { text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 6px; font-size: 12.5px; }
    .pct-pill { background: #FAF7F2; border: 1px solid #e2d7c7; color: #6b5e52; padding: 1px 6px; border-radius: 999px; font-size: 11px; font-weight: 700; }

    .vbar-box { background: #FAF7F2; border: 1px solid #ede4d8; border-radius: 12px; padding: 14px; }
    .vbar-stage { display: flex; align-items: flex-end; justify-content: space-around; height: 210px; gap: 8px; padding-top: 16px; }
    .vbar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; min-width: 36px; }
    .vbar-top-val { font-size: 10.5px; font-weight: 700; color: #3B2F2F; margin-bottom: 4px; }
    .vbar-rail { flex: 1; width: 100%; max-width: 34px; background: #ebe1d4; border-radius: 8px 8px 4px 4px; display: flex; align-items: flex-end; overflow: hidden; }
    .vbar-pillar { width: 100%; border-radius: 8px 8px 0 0; transition: height .35s ease; }
    .vbar-name { font-size: 10.5px; color: #5c534a; margin-top: 6px; text-align: center; max-width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .pie-layout { display: grid; grid-template-columns: 260px 1fr; gap: 24px; align-items: center; }
    @media (max-width: 780px) { .pie-layout { grid-template-columns: 1fr; } }
    .pie-svg-wrap { display: flex; justify-content: center; }
    .donut-svg { width: 220px; height: 220px; }
    .donut-center-lbl { font-size: 10px; font-weight: 700; fill: #8a7f75; letter-spacing: .08em; }
    .donut-center-val { font-size: 16px; font-weight: 800; fill: #3B2F2F; }
    .pie-legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-item {
      display: grid; grid-template-columns: 14px 1fr auto auto; align-items: center; gap: 10px;
      padding: 7px 10px; background: #FAF7F2; border-radius: 8px; font-size: 13px;
    }
    .legend-dot { width: 12px; height: 12px; border-radius: 4px; }
    .legend-name { font-weight: 600; color: #2b2118; }
    .legend-val { font-weight: 700; color: #3B2F2F; }

    .line-layout { background: #FAF7F2; border: 1px solid #ede4d8; border-radius: 12px; padding: 16px; }
    .line-svg { width: 100%; height: auto; max-height: 280px; overflow: visible; }

    .cat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
    .cat-card { background: #FAF7F2; border: 1px solid #ede4d8; border-radius: 10px; padding: 12px 14px; }
    .rep-badge {
      display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 700;
      background: #f2ebe1; color: #6e4720;
    }
    .btn-voice {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 14px; border-radius: 8px; font-size: 13px; font-weight: 700;
      border: 1.5px solid #8B5A2B; background: #FAF7F2; color: #6F4518;
      cursor: pointer; transition: all .2s ease; white-space: nowrap;
    }
    .btn-voice:hover { background: #f0e6d8; }
    .btn-voice.listening {
      background: #fef2f2; border-color: #dc2626; color: #b91c1c;
      box-shadow: 0 0 0 3px rgba(220,38,38,.18);
    }
    .mic-dot {
      width: 9px; height: 9px; border-radius: 50%; background: #dc2626;
      display: inline-block; animation: pulseMic 1s infinite ease-in-out;
    }
    @keyframes pulseMic {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.45); opacity: 0.45; }
    }
    .voice-banner {
      margin-top: 8px; padding: 7px 12px; border-radius: 8px; font-size: 12.5px;
      background: #f5efe6; color: #5c534a; border: 1px solid #e2d5c4;
    }
    .voice-banner.active {
      background: #fef2f2; color: #991b1b; border-color: #fecaca; font-weight: 600;
    }
  `],
})
export class ReportsComponent implements OnInit, OnDestroy {
  Math = Math;
  query = '';
  loading = false;
  syncing = false;
  useLocalEngine = false;
  errorMsg = '';
  result: OfflineReportResult | null = null;

  // — Soporte de Reconocimiento y Síntesis de Voz (Web Speech API) —
  isListening = false;
  isSpeaking = false;
  voiceStatus = '';
  private recognition: any = null;

  chartType: ChartType = 'bar';
  numericColumns: string[] = [];
  selectedMetric = '';
  labelColumn = '';
  categoryColumn = '';

  chartPoints: ChartPoint[] = [];
  pieSlices: PieSlice[] = [];
  categoryPoints: ChartPoint[] = [];
  lineCoords: { x: number; y: number; label: string; value: number }[] = [];
  linePathPoints = '';
  lineAreaPoints = '';

  kpiTotal = 0;
  kpiAvg = 0;
  kpiMax = 0;
  kpiTopLabel = '—';
  kpiTopShare = 0;
  activeCount = 0;
  activePct = 0;

  presets = [
    '¿Cuáles son los mejores clientes y cuánto facturaron?',
    '¿Qué pedidos están pendientes o en producción?',
    '¿Qué muebles tienen stock bajo en la Tienda?',
    '¿Cuáles son las entregas programadas?',
    '¿Cuál es la carga de trabajo de los carpinteros?',
    'Resumen de cotizaciones registradas',
  ];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private apollo: Apollo,
    private api: ApiService,
    private zone: NgZone,
    public offlineAi: OfflineAiService,
  ) {}

  ngOnInit(): void {
    this.query = this.presets[0];
    this.syncLiveData(false);
  }

  ngOnDestroy(): void {
    this.stopVoiceInput();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Inicia o detiene el reconocimiento de voz en español usando Web Speech API
   * (`SpeechRecognition` / `webkitSpeechRecognition`). Al terminar de hablar,
   * ejecuta automáticamente `ask()` para generar el reporte dinámico.
   */
  toggleVoiceInput(): void {
    if (this.isListening) {
      this.stopVoiceInput();
      return;
    }

    const w = typeof window !== 'undefined' ? (window as any) : null;
    const SpeechRecognition = w?.SpeechRecognition || w?.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.errorMsg =
        'Tu navegador no soporta reconocimiento de voz nativo. Usa Google Chrome o Microsoft Edge.';
      return;
    }

    this.errorMsg = '';
    this.voiceStatus = '';

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'es-BO';
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      let finalTranscript = '';

      rec.onstart = () => {
        this.zone.run(() => {
          this.isListening = true;
          this.voiceStatus = '';
        });
      };

      rec.onresult = (event: any) => {
        this.zone.run(() => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interim += transcript;
            }
          }
          const currentText = (finalTranscript || interim).trim();
          if (currentText) {
            this.query = currentText;
          }
        });
      };

      rec.onerror = (event: any) => {
        this.zone.run(() => {
          this.isListening = false;
          if (event?.error === 'not-allowed') {
            this.errorMsg = 'Permiso de micrófono denegado. Habilita el micrófono en la barra del navegador.';
          } else if (event?.error === 'no-speech') {
            this.voiceStatus = 'No se detectó voz. Intenta hablar más cerca del micrófono.';
          } else {
            this.errorMsg = `Error de reconocimiento de voz: ${event?.error || 'desconocido'}`;
          }
        });
      };

      rec.onend = () => {
        this.zone.run(() => {
          this.isListening = false;
          if (this.query && this.query.trim().length > 2) {
            this.voiceStatus = `✅ Consulta por voz reconocida: "${this.query}"`;
            this.ask();
          }
        });
      };

      this.recognition = rec;
      rec.start();
    } catch {
      this.isListening = false;
      this.errorMsg = 'No se pudo iniciar el micrófono.';
    }
  }

  stopVoiceInput(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  /**
   * Lee en voz alta la Conclusión Ejecutiva del reporte usando SpeechSynthesis en español.
   */
  toggleSpeakNarrative(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      return;
    }
    if (!this.result?.narrative) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.result.narrative);
    utterance.lang = 'es-ES';
    utterance.rate = 1.02;
    utterance.onend = () => {
      this.zone.run(() => {
        this.isSpeaking = false;
      });
    };
    utterance.onerror = () => {
      this.zone.run(() => {
        this.isSpeaking = false;
      });
    };
    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Sincroniza clientes, pedidos, carpinteros, entregas, productos y cotizaciones
   * directamente desde el backend antes de calcular el reporte para garantizar
   * consistencia total sin importar por qué pestaña entró el administrador.
   */
  async syncLiveData(showIndicator = false): Promise<void> {
    if (this.offlineAi.offline()) {
      this.ask();
      return;
    }
    if (showIndicator) this.syncing = true;
    try {
      const [clientsRes, ordersRes, carpRes, delivRes, prods, quots] = await Promise.allSettled([
        firstValueFrom(this.apollo.query<{ clients: any[] }>({ query: CLIENTS, fetchPolicy: 'network-only' })),
        firstValueFrom(this.apollo.query<{ orders: any[] }>({ query: ORDERS, fetchPolicy: 'network-only' })),
        firstValueFrom(this.apollo.query<{ carpenters: any[] }>({ query: CARPENTERS, fetchPolicy: 'network-only' })),
        firstValueFrom(this.apollo.query<{ deliveries: any[] }>({ query: DELIVERIES, fetchPolicy: 'network-only' })),
        this.api.products(),
        this.api.quotations(),
      ]);

      if (clientsRes.status === 'fulfilled' && clientsRes.value.data?.clients?.length) {
        this.offlineAi.setClients(clientsRes.value.data.clients);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.orders?.length) {
        this.offlineAi.setOrders(ordersRes.value.data.orders);
      }
      if (carpRes.status === 'fulfilled' && carpRes.value.data?.carpenters?.length) {
        this.offlineAi.setCarpenters(carpRes.value.data.carpenters);
      }
      if (delivRes.status === 'fulfilled' && delivRes.value.data?.deliveries?.length) {
        this.offlineAi.setDeliveries(delivRes.value.data.deliveries);
      }
      if (prods.status === 'fulfilled' && prods.value?.length) {
        this.offlineAi.setProducts(prods.value);
      }
      if (quots.status === 'fulfilled' && quots.value?.length) {
        this.offlineAi.setQuotations(quots.value);
      }
    } catch {
      // Si falla alguna llamada de red, usamos caché local sincronizada
    } finally {
      this.syncing = false;
      this.ask();
    }
  }

  get isLocalMode(): boolean {
    return this.offlineAi.offline() || this.useLocalEngine;
  }

  toggleEngineMode(): void {
    if (this.isLocalMode) {
      this.useLocalEngine = false;
      if (this.offlineAi.isForceOffline()) {
        this.offlineAi.toggleForceOffline(false);
      }
      this.offlineAi.markNetworkSuccess();
    } else {
      this.useLocalEngine = true;
    }
    this.ask();
  }

  runPreset(presetText: string): void {
    this.query = presetText;
    this.ask();
  }

  ask(): void {
    if (!this.query.trim()) return;
    this.loading = true;
    this.errorMsg = '';

    // Para garantizar 100% de consistencia con los datos en vivo de GraphQL/REST
    // y traducción completa al español, ejecutamos el motor analítico sobre las tablas sincronizadas:
    if (this.isLocalMode) {
      try {
        this.applyResult(this.offlineAi.generateOfflineReport(this.query));
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
            const translatedRows = this.offlineAi.translateReportRows(r.rows);
            // Verificar si la consulta de clientes devolvió todo en 0 por desfase y preferir motor sincronizado
            const allZero = translatedRows.every((row) =>
              Object.entries(row)
                .filter(([k]) => !/(^id$|_id$)/i.test(k) && typeof row[k] === 'number')
                .every(([, v]) => Number(v) === 0),
            );
            if (!allZero) {
              this.applyResult({
                ...r,
                rows: translatedRows,
                source: r.source === 'llm'
                  ? 'Ollama IA (Text-to-SQL en Servidor PostgreSQL)'
                  : r.source === 'template'
                    ? 'Servidor PostgreSQL + Narrativa IA'
                    : r.source,
              });
              this.loading = false;
              return;
            }
          }
          this.applyResult(this.offlineAi.generateOfflineReport(this.query));
          this.loading = false;
        },
        error: (err) => {
          if (!err?.status || err.status === 0) {
            this.offlineAi.markNetworkFailure();
          }
          try {
            this.applyResult(this.offlineAi.generateOfflineReport(this.query));
          } catch (e) {
            this.errorMsg = (e as Error).message;
          }
          this.loading = false;
        },
      });
  }

  private applyResult(res: OfflineReportResult): void {
    this.result = {
      ...res,
      rows: this.offlineAi.translateReportRows(res.rows ?? []),
    };
    this.detectColumns();
    this.rebuildCharts();
  }

  private detectColumns(): void {
    const rows = this.result?.rows ?? [];
    if (!rows.length) {
      this.numericColumns = [];
      this.selectedMetric = '';
      this.labelColumn = '';
      this.categoryColumn = '';
      return;
    }
    const cols = Object.keys(rows[0]);
    const idRegex = /(^id$|_id$)/i;

    this.numericColumns = cols.filter(
      (c) => !idRegex.test(c) && rows.some((r) => typeof r[c] === 'number' && !isNaN(r[c])),
    );
    // Preferir columnas de dinero (Bs) o total como métrica inicial por defecto
    const preferredMetric =
      this.numericColumns.find((c) => /bs|monto|total|precio|valor/i.test(c)) ??
      this.numericColumns[this.numericColumns.length - 1] ??
      '';
    this.selectedMetric = preferredMetric;

    // Columna de nombre/etiqueta principal
    this.labelColumn =
      cols.find((c) => /cliente|mueble|carpintero|descripcion|nombre/i.test(c)) ??
      cols.find((c) => !idRegex.test(c) && typeof rows[0][c] === 'string') ??
      cols[0] ??
      '';

    // Columna de categoría/segmento/estado para vista agrupada
    this.categoryColumn =
      cols.find((c) => /segmento|estado|categoria|especialidad|modalidad|madera|horario/i.test(c)) ?? '';
  }

  rebuildCharts(): void {
    const rows = this.result?.rows ?? [];
    if (!rows.length || !this.selectedMetric) {
      this.chartPoints = [];
      this.pieSlices = [];
      this.categoryPoints = [];
      this.lineCoords = [];
      return;
    }

    const values = rows.map((r) => Number(r[this.selectedMetric] || 0));
    this.kpiTotal = Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
    this.kpiMax = Math.max(0, ...values);
    this.kpiAvg = rows.length ? Math.round((this.kpiTotal / rows.length) * 100) / 100 : 0;
    this.activeCount = values.filter((v) => v > 0).length;
    this.activePct = rows.length ? Math.round((this.activeCount / rows.length) * 100) : 0;

    const maxSafe = Math.max(1, this.kpiMax);
    const totalSafe = Math.max(1, this.kpiTotal);

    const pts: ChartPoint[] = rows.map((r, idx) => {
      const val = Number(r[this.selectedMetric] || 0);
      const lbl = String(r[this.labelColumn] ?? `#${idx + 1}`);
      const sub = this.categoryColumn && r[this.categoryColumn] ? String(r[this.categoryColumn]) : undefined;
      return {
        label: lbl,
        sublabel: sub,
        value: val,
        pctOfMax: Math.round((val / maxSafe) * 100),
        pctOfTotal: this.kpiTotal > 0 ? Math.round((val / totalSafe) * 1000) / 10 : 0,
        color: PALETTE[idx % PALETTE.length],
      };
    });

    this.chartPoints = pts;

    const sorted = [...pts].sort((a, b) => b.value - a.value);
    this.kpiTopLabel = sorted[0]?.label ?? '—';
    this.kpiTopShare = sorted[0]?.pctOfTotal ?? 0;

    // Construir Torta / Anillo SVG (circunferencia = 2 * PI * 78 ≈ 490.09)
    const circumference = 2 * Math.PI * 78;
    const positivePts = pts.filter((p) => p.value > 0);
    const sourceForPie = positivePts.length > 0 ? positivePts : pts.slice(0, 6);
    const pieTotal = Math.max(1, sourceForPie.reduce((acc, p) => acc + (p.value > 0 ? p.value : 1), 0));

    let accumulatedLen = 0;
    this.pieSlices = sourceForPie.map((p, idx) => {
      const weight = p.value > 0 ? p.value : 1;
      const sliceLen = (weight / pieTotal) * circumference;
      const slice: PieSlice = {
        ...p,
        color: PALETTE[idx % PALETTE.length],
        dashArray: `${sliceLen} ${circumference - sliceLen}`,
        dashOffset: -accumulatedLen,
      };
      accumulatedLen += sliceLen;
      return slice;
    });

    // Construir Gráfica de Líneas SVG (ancho útil X: 75..710, alto útil Y: 35..210)
    const linePts = pts.slice(0, 10);
    const stepX = linePts.length > 1 ? 635 / (linePts.length - 1) : 0;
    this.lineCoords = linePts.map((p, i) => {
      const x = linePts.length > 1 ? Math.round(75 + i * stepX) : 390;
      const y = Math.round(210 - (p.value / maxSafe) * 170);
      return { x, y, label: p.label, value: p.value };
    });
    this.linePathPoints = this.lineCoords.map((c) => `${c.x},${c.y}`).join(' ');
    if (this.lineCoords.length > 0) {
      const firstX = this.lineCoords[0].x;
      const lastX = this.lineCoords[this.lineCoords.length - 1].x;
      this.lineAreaPoints = `${firstX},210 ${this.linePathPoints} ${lastX},210`;
    } else {
      this.lineAreaPoints = '';
    }

    // Construir Agrupación por Categoría / Segmento / Estado
    if (this.categoryColumn) {
      const groups = new Map<string, { sum: number; count: number }>();
      for (const r of rows) {
        const key = String(r[this.categoryColumn] ?? 'General');
        const val = Number(r[this.selectedMetric] || 0);
        const cur = groups.get(key) ?? { sum: 0, count: 0 };
        cur.sum += val;
        cur.count += 1;
        groups.set(key, cur);
      }
      const catEntries = Array.from(groups.entries()).sort((a, b) => b[1].sum - a[1].sum || b[1].count - a[1].count);
      const maxCat = Math.max(1, ...catEntries.map(([, v]) => v.sum || v.count));
      const totalCat = Math.max(1, catEntries.reduce((s, [, v]) => s + (v.sum || v.count), 0));

      this.categoryPoints = catEntries.map(([label, info], idx) => {
        const metricVal = this.kpiTotal > 0 ? Math.round(info.sum * 100) / 100 : info.count;
        return {
          label,
          sublabel: `${info.count} registro(s)`,
          value: metricVal,
          pctOfMax: Math.round(((info.sum || info.count) / maxCat) * 100),
          pctOfTotal: Math.round(((info.sum || info.count) / totalCat) * 1000) / 10,
          color: PALETTE[idx % PALETTE.length],
        };
      });
    } else {
      this.categoryPoints = [];
    }
  }

  cleanCol(col: string): string {
    return col.replace(/_/g, ' ');
  }

  isCurrencyMetric(col: string): boolean {
    return /bs|monto|precio|valor|tarifa/i.test(col);
  }

  isBadgeCol(col: string): boolean {
    return /segmento|estado|modalidad|especialidad|entrega/i.test(col);
  }

  formatCell(col: string, val: any): string {
    if (typeof val === 'number') {
      if (this.isCurrencyMetric(col)) {
        return `Bs ${val.toLocaleString('es-BO')}`;
      }
      return val.toLocaleString('es-BO');
    }
    return String(val ?? '—');
  }

  fmtNum(n: number): string {
    return Number(n || 0).toLocaleString('es-BO');
  }

  fmtShort(n: number): string {
    const val = Number(n || 0);
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return String(Math.round(val * 10) / 10);
  }

  shortLabel(lbl: string): string {
    const clean = String(lbl || '');
    return clean.length > 13 ? clean.slice(0, 12) + '…' : clean;
  }

  exportPdf(): void {
    if (!this.result) return;
    this.offlineAi.exportReportToPdf(this.result, this.query || 'Reporte Ejecutivo');
  }

  exportCsv(): void {
    if (!this.result) return;
    this.offlineAi.exportReportToCsv(this.result, this.query || 'Reporte Ejecutivo');
  }

  keys(row: Record<string, any>): string[] {
    return Object.keys(row);
  }
}
