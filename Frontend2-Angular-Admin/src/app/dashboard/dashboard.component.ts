import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo, QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { ORDERS, CLIENTS, CARPENTERS, DELIVERIES, ORDER_STATUS_CHANGED } from '../graphql.operations';
import { ApiService, Quotation } from '../api.service';
import { ToastService } from '../toast.service';
import { orderLabel, deliveryLabel, slotLabel, fmtDate, fmtMoney } from '../labels';

const ACTIVE_ORDER = ['PENDING', 'APPROVED', 'IN_PRODUCTION', 'READY'];
const OPEN_DELIVERY = ['SCHEDULED', 'IN_TRANSIT', 'RESCHEDULED'];

interface Alert { level: 'red' | 'amber' | 'blue'; text: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toolbar">
      <h2 class="sec" style="margin:0">Dashboard</h2>
      <div class="grow"></div>
      <button class="btn btn-ghost btn-sm" (click)="load()">Actualizar</button>
    </div>

    <!-- KPIs principales -->
    <div class="kpi-grid">
      <div class="kpi"><div class="n">{{ activeOrders().length }}</div><div class="l">Pedidos activos</div><div class="s">{{ count('IN_PRODUCTION') }} en producción · {{ count('PENDING') }} por aprobar</div></div>
      <div class="kpi"><div class="n">Bs. {{ fmtMoney(deliveredRevenue()) }}</div><div class="l">Ingresos entregados</div><div class="s">{{ count('DELIVERED') }} pedidos entregados</div></div>
      <div class="kpi"><div class="n">{{ upcomingDeliveries().length }}</div><div class="l">Entregas próx. 7 días</div><div class="s">{{ nextDeliveryLabel() }}</div></div>
      <div class="kpi"><div class="n">{{ pendingQuotations().length }}</div><div class="l">Cotizaciones pendientes</div><div class="s">Bs. {{ fmtMoney(quotationsPipeline()) }} potenciales</div></div>
      <div class="kpi"><div class="n">{{ clients.length }}</div><div class="l">Clientes</div><div class="s">{{ vipCount() }} VIP · {{ wholesaleCount() }} mayoristas</div></div>
      <div class="kpi"><div class="n">{{ activeCarpenters().length }}</div><div class="l">Carpinteros activos</div><div class="s">{{ carpenters.length - activeCarpenters().length }} inactivos</div></div>
    </div>

    <div class="dash-grid">
      <!-- Pipeline de estados -->
      <div class="card">
        <h3 class="sub">Pipeline de pedidos</h3>
        @for (row of pipeline(); track row.status) {
          <div class="bar-row">
            <span class="nm">{{ row.label }}</span>
            <div class="bar-track"><div class="bar-fill" [style.width.%]="row.pct" [style.background]="row.color"></div></div>
            <span class="vl">{{ row.count }}</span>
          </div>
        }
        <p class="empty-note" style="margin-bottom:0">Total: {{ orders.length }} pedidos históricos</p>
      </div>

      <!-- Alertas operativas -->
      <div class="card">
        <h3 class="sub">Alertas operativas</h3>
        @if (!alerts().length) { <p class="empty-note">Sin alertas — todo bajo control.</p> }
        @for (a of alerts(); track a.text) {
          <div class="alert-item"><span class="alert-dot" [class]="'alert-dot ' + a.level"></span><span>{{ a.text }}</span></div>
        }
      </div>

      <!-- Entregas próximas -->
      <div class="card">
        <h3 class="sub">Agenda de entregas</h3>
        @if (!agenda().length) { <p class="empty-note">No hay entregas programadas abiertas.</p> }
        <table *ngIf="agenda().length">
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Turno</th><th>Estado</th></tr></thead>
          <tbody>
            <tr *ngFor="let d of agenda()">
              <td>#{{ d.orderId }}</td>
              <td>{{ clientOf(d.orderId) }}</td>
              <td [style.color]="isOverdue(d) ? '#b03434' : 'inherit'" [style.font-weight]="isOverdue(d) ? '700' : '400'">{{ fmtDate(d.scheduledDate) }}</td>
              <td>{{ slotLabel(d.timeSlot) }}</td>
              <td><span class="badge" [class]="'badge st-' + d.status">{{ deliveryLabel(d.status) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Carga por carpintero -->
      <div class="card">
        <h3 class="sub">Carga de trabajo — carpinteros activos</h3>
        @for (w of workload(); track w.id) {
          <div class="bar-row">
            <span class="nm">{{ w.name }}</span>
            <div class="bar-track"><div class="bar-fill" [style.width.%]="w.pct" style="background:#8B5A2B"></div></div>
            <span class="vl">{{ w.count }}</span>
          </div>
        }
        <p class="empty-note" style="margin-bottom:0">Pedidos activos asignados por carpintero</p>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  clients: any[] = [];
  carpenters: any[] = [];
  deliveries: any[] = [];
  quotations: Quotation[] = [];

  private ordersRef?: QueryRef<{ orders: any[] }>;
  private subs: Subscription[] = [];

  constructor(private apollo: Apollo, private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
    // Tiempo real: cambio de estado de pedido → refrescar tarjetas
    this.subs.push(
      this.apollo.subscribe<{ orderStatusChanged: { id: string; status: string } }>({ query: ORDER_STATUS_CHANGED })
        .subscribe(({ data }) => {
          const ev = data?.orderStatusChanged;
          if (ev) {
            this.toast.info(`Pedido #${ev.id} → ${orderLabel(ev.status)}`);
            this.ordersRef?.refetch();
          }
        }),
    );
  }

  ngOnDestroy(): void { this.subs.forEach((s) => s.unsubscribe()); }

  load(): void {
    this.ordersRef = this.apollo.watchQuery<{ orders: any[] }>({ query: ORDERS });
    this.subs.push(this.ordersRef.valueChanges.subscribe(({ data }) => (this.orders = data.orders)));
    this.subs.push(
      this.apollo.watchQuery<{ clients: any[] }>({ query: CLIENTS }).valueChanges.subscribe(({ data }) => (this.clients = data.clients)),
      this.apollo.watchQuery<{ carpenters: any[] }>({ query: CARPENTERS }).valueChanges.subscribe(({ data }) => (this.carpenters = data.carpenters)),
      this.apollo.watchQuery<{ deliveries: any[] }>({ query: DELIVERIES }).valueChanges.subscribe(({ data }) => (this.deliveries = data.deliveries)),
    );
    this.api.quotations().then((q) => (this.quotations = q)).catch(() => {});
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────
  activeOrders(): any[] { return this.orders.filter((o) => ACTIVE_ORDER.includes(o.status)); }
  count(status: string): number { return this.orders.filter((o) => o.status === status).length; }
  deliveredRevenue(): number { return this.orders.filter((o) => o.status === 'DELIVERED').reduce((s, o) => s + (o.totalPrice ?? 0), 0); }
  pendingQuotations(): Quotation[] { return this.quotations.filter((q) => q.status === 'QUOTED' || q.status === 'DRAFT'); }
  quotationsPipeline(): number { return this.pendingQuotations().reduce((s, q) => s + (q.totalAmount ?? 0), 0); }
  activeCarpenters(): any[] { return this.carpenters.filter((c) => c.active); }
  vipCount(): number { return this.clients.filter((c) => c.segment === 'VIP').length; }
  wholesaleCount(): number { return this.clients.filter((c) => c.segment === 'WHOLESALE').length; }

  upcomingDeliveries(): any[] {
    const limit = this.addDays(7);
    return this.deliveries
      .filter((d) => OPEN_DELIVERY.includes(d.status) && d.scheduledDate <= limit)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }

  agenda(): any[] {
    const limit = this.addDays(7);
    return this.deliveries
      .filter((d) => (OPEN_DELIVERY.includes(d.status) && d.scheduledDate <= limit) || (d.status === 'DELIVERED' && d.scheduledDate >= this.today()))
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
      .slice(0, 8);
  }

  nextDeliveryLabel(): string {
    const next = this.upcomingDeliveries().find((d) => d.scheduledDate >= this.today());
    if (!next) return 'Sin entregas futuras';
    return next.scheduledDate === this.today() ? '¡Hoy hay entrega!' : `Próxima: ${fmtDate(next.scheduledDate)}`;
  }

  alerts(): Alert[] {
    const out: Alert[] = [];
    for (const d of this.deliveries) {
      if (OPEN_DELIVERY.includes(d.status) && d.scheduledDate < this.today()) {
        out.push({ level: 'red', text: `Entrega vencida — pedido #${d.orderId} debió entregarse el ${fmtDate(d.scheduledDate)}` });
      }
    }
    for (const o of this.orders) {
      if ((o.status === 'APPROVED' || o.status === 'IN_PRODUCTION') && !(o.carpenters?.length)) {
        out.push({ level: 'amber', text: `Pedido #${o.id} (${orderLabel(o.status).toLowerCase()}) sin carpintero asignado` });
      }
    }
    for (const q of this.pendingQuotations().slice(0, 4)) {
      out.push({ level: 'blue', text: `Cotización de ${q.clientId} por Bs. ${fmtMoney(q.totalAmount)} espera aprobación` });
    }
    return out.slice(0, 9);
  }

  pipeline(): { status: string; label: string; count: number; pct: number; color: string }[] {
    const defs: [string, string, string][] = [
      ['PENDING', 'Pendiente', '#d99a2b'],
      ['APPROVED', 'Aprobado', '#1d5aa8'],
      ['IN_PRODUCTION', 'En producción', '#5a3fb8'],
      ['READY', 'Listo', '#1a7aa8'],
      ['DELIVERED', 'Entregado', '#1e7a4f'],
      ['CANCELLED', 'Cancelado', '#b03434'],
    ];
    const counts = defs.map(([s]) => this.count(s));
    const max = Math.max(1, ...counts);
    return defs.map(([status, label, color], i) => ({
      status, label, color, count: counts[i], pct: (counts[i] / max) * 100,
    }));
  }

  workload(): { id: string; name: string; count: number; pct: number }[] {
    const rows = this.activeCarpenters().map((c) => ({
      id: c.id as string,
      name: c.name as string,
      count: this.activeOrders().filter((o) => o.carpenters?.some((x: any) => x.id === c.id)).length,
      pct: 0,
    }));
    const max = Math.max(1, ...rows.map((r) => r.count));
    rows.forEach((r) => (r.pct = (r.count / max) * 100));
    return rows.sort((a, b) => b.count - a.count);
  }

  // ── helpers ───────────────────────────────────────────────────────────────
  clientOf(orderId: string): string {
    return this.orders.find((o) => String(o.id) === String(orderId))?.client?.name ?? '—';
  }
  isOverdue(d: any): boolean { return OPEN_DELIVERY.includes(d.status) && d.scheduledDate < this.today(); }
  fmtDate = fmtDate;
  fmtMoney = fmtMoney;
  slotLabel = slotLabel;
  deliveryLabel = deliveryLabel;
  today(): string { return new Date().toISOString().slice(0, 10); }
  private addDays(n: number): string {
    const d = new Date(); d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }
}
