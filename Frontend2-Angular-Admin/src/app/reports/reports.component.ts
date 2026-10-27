import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Reportes en Lenguaje Natural (CU7)</h2>
    <div class="card">
      <p>Ej.: «¿cuántas entregas hay para octubre?», «mejores clientes», «materiales con stock bajo»</p>
      <div style="display:flex;gap:8px">
        <input [(ngModel)]="query" placeholder="Escribe tu consulta..." style="flex:1" (keyup.enter)="ask()" />
        <button class="btn" (click)="ask()" [disabled]="loading">Consultar</button>
      </div>
    </div>
    <div *ngIf="loading" class="card" style="margin-top:12px">Consultando IA…</div>
    <div *ngIf="result" class="card" style="margin-top:12px">
      <p><em>{{ result.narrative }}</em></p>
      <p style="font-size:12px;color:#888">Fuente: {{ result.source }} · SQL: <code>{{ result.sql }}</code></p>
      <table *ngIf="result.rows?.length">
        <thead><tr><th *ngFor="let k of keys(result.rows[0])">{{ k }}</th></tr></thead>
        <tbody>
          <tr *ngFor="let row of result.rows"><td *ngFor="let k of keys(row)">{{ row[k] }}</td></tr>
        </tbody>
      </table>
    </div>
  `,
})
export class ReportsComponent {
  query = '';
  loading = false;
  result: any = null;

  constructor(private http: HttpClient) {}

  ask(): void {
    if (!this.query.trim()) return;
    this.loading = true;
    this.http.post<any>(`${environment.aiApiUrl}/ai/report`, { query: this.query })
      .subscribe({
        next: (r) => { this.result = r; this.loading = false; },
        error: () => { this.loading = false; },
      });
  }

  keys(row: any): string[] {
    return Object.keys(row);
  }
}
