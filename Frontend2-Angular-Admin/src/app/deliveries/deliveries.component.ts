import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Apollo, QueryRef } from 'apollo-angular';
import {
  DELIVERIES, ORDERS, DELIVERY_CAPACITY,
  SCHEDULE_DELIVERY, UPDATE_DELIVERY_STATUS, RESCHEDULE_DELIVERY,
} from '../graphql.operations';
import { ToastService } from '../toast.service';
import { ConfirmService } from '../confirm.service';
import { ActionsMenuComponent, ActionItem } from '../actions-menu.component';
import { DELIVERY_STATUS, TIME_SLOT, deliveryTypeLabel, fmtDate } from '../labels';

const SLOTS: [string, string][] = [['MORNING', 'Mañana'], ['AFTERNOON', 'Tarde'], ['EVENING', 'Noche']];
/** Flujo operativo de entregas. */
const NEXT: Record<string, string[]> = {
  SCHEDULED: ['IN_TRANSIT', 'FAILED'],
  IN_TRANSIT: ['DELIVERED', 'FAILED'],
  RESCHEDULED: ['IN_TRANSIT', 'FAILED'],
  DELIVERED: [],
  FAILED: [],
};

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ActionsMenuComponent],
  template: `
    <div class="toolbar">
      <h2 class="sec" style="margin:0">Entregas</h2>
      <div class="grow"></div>
      <button class="btn" (click)="openSchedule()">+ Programar entrega</button>
    </div>

    <div class="chips">
      <button class="chip" [class.on]="tab === 'open'" (click)="tab = 'open'">Abiertas ({{ open().length }})</button>
      <button class="chip" [class.on]="tab === 'done'" (click)="tab = 'done'">Cerradas ({{ closed().length }})</button>
      <button class="chip" [class.on]="tab === 'all'" (click)="tab = 'all'">Todas ({{ deliveries.length }})</button>
    </div>

    <div class="card">
      <table>
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Turno</th><th>Modalidad</th><th>Dirección</th><th>Estado</th><th>Notas</th><th style="width:60px"></th></tr></thead>
        <tbody>
          <tr *ngFor="let d of visible()" [style.background]="overdue(d) ? '#FFF9F4' : 'inherit'">
            <td><strong>#{{ d.orderId }}</strong></td>
            <td>{{ clientOf(d.orderId) }}</td>
            <td>
              {{ fmtDate(d.scheduledDate) }}
              <span *ngIf="overdue(d)" class="badge st-FAILED" style="margin-left:4px">vencida</span>
            </td>
            <td>{{ slotLabel(d.timeSlot) }}</td>
            <td><span class="badge" [class]="d.deliveryType === 'PICKUP' ? 'badge st-READY' : 'badge st-QUOTED'">{{ deliveryTypeLabel(d.deliveryType) }}</span></td>
            <td>
              {{ d.deliveryType === 'PICKUP' ? 'Recoge en el taller' : (d.address || '—') }}
              <a *ngIf="d.latitude && d.longitude" target="_blank" rel="noopener"
                 [href]="'https://www.google.com/maps?q=' + d.latitude + ',' + d.longitude"
                 style="display:block;font-size:12px;color:#1a5276">ver ubicación GPS</a>
            </td>
            <td><span class="badge" [class]="'badge st-' + d.status">{{ label(d.status) }}</span></td>
            <td>{{ d.notes || '—' }}</td>
            <td><app-actions-menu [items]="actionsOf(d)" /></td>
          </tr>
          <tr *ngIf="!visible().length"><td colspan="9" class="empty-note">Sin entregas en esta vista.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modal programar -->
    @if (showSchedule) {
      <div class="modal-backdrop" (click)="showSchedule = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-head"><h3>Programar entrega</h3><button class="modal-x" (click)="showSchedule = false">×</button></div>
          <form [formGroup]="form" (ngSubmit)="schedule()">
            <div class="modal-body form-grid">
              <label class="f full">Pedido *
                <select formControlName="orderId">
                  <option value="" disabled>Seleccionar pedido…</option>
                  <option *ngFor="let o of schedulableOrders()" [value]="o.id">#{{ o.id }} — {{ o.client?.name }} — {{ o.description || 'sin descripción' }}</option>
                </select>
              </label>
              <label class="f">Fecha *
                <input formControlName="scheduledDate" type="date" (change)="checkCapacity()" />
                <span class="hint" *ngIf="capacity !== null">Capacidad restante ese día: {{ capacity }}</span>
              </label>
              <label class="f">Turno
                <select formControlName="timeSlot">
                  <option *ngFor="let s of slots" [value]="s[0]">{{ s[1] }}</option>
                </select>
              </label>
              <label class="f">Modalidad
                <select formControlName="deliveryType">
                  <option value="DELIVERY">Envío a domicilio</option>
                  <option value="PICKUP">El cliente recoge en el taller</option>
                </select>
              </label>
              <p class="hint" *ngIf="orderPref()" style="margin:0">
                El cliente pidió: {{ orderPref() }}
              </p>
              <label class="f full">Dirección<input formControlName="address" placeholder="Ej.: Av. Arce 123, La Paz" /></label>
              <label class="f">Latitud (GPS)<input formControlName="latitude" type="number" step="any" placeholder="-17.7833" /></label>
              <label class="f">Longitud (GPS)<input formControlName="longitude" type="number" step="any" placeholder="-63.1821" /></label>
              <label class="f full">Notas<textarea formControlName="notes" rows="2" placeholder="Ej.: Tercer piso sin ascensor"></textarea></label>
            </div>
            <div class="modal-foot">
              <button type="button" class="btn btn-ghost" (click)="showSchedule = false">Cancelar</button>
              <button type="submit" class="btn" [disabled]="form.invalid || saving">{{ saving ? 'Guardando…' : 'Programar' }}</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal reprogramar -->
    @if (rescheduling) {
      <div class="modal-backdrop" (click)="rescheduling = null">
        <div class="modal" style="width:min(400px,94vw)" (click)="$event.stopPropagation()">
          <div class="modal-head"><h3>Reprogramar entrega del pedido #{{ rescheduling.orderId }}</h3><button class="modal-x" (click)="rescheduling = null">×</button></div>
          <div class="modal-body">
            <label class="f">Nueva fecha<input type="date" [(ngModel)]="newDate" /></label>
            <p class="hint" style="margin-top:8px">Fecha actual: {{ fmtDate(rescheduling.scheduledDate) }}. El estado pasará a Reprogramada.</p>
          </div>
          <div class="modal-foot">
            <button class="btn btn-ghost" (click)="rescheduling = null">Cancelar</button>
            <button class="btn" (click)="doReschedule()" [disabled]="!newDate || saving">{{ saving ? 'Guardando…' : 'Reprogramar' }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DeliveriesComponent implements OnInit {
  deliveries: any[] = [];
  orders: any[] = [];
  tab: 'open' | 'done' | 'all' = 'open';
  slots = SLOTS;
  form: FormGroup;
  showSchedule = false;
  rescheduling: any = null;
  newDate = '';
  capacity: number | null = null;
  saving = false;
  private ref?: QueryRef<{ deliveries: any[] }>;

  constructor(
    private apollo: Apollo, fb: FormBuilder,
    private toast: ToastService, private confirm: ConfirmService,
  ) {
    this.form = fb.group({
      orderId: ['', Validators.required],
      scheduledDate: ['', Validators.required],
      timeSlot: ['MORNING'],
      deliveryType: ['DELIVERY'],
      address: [''],
      latitude: [null],
      longitude: [null],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.ref = this.apollo.watchQuery<{ deliveries: any[] }>({ query: DELIVERIES });
    this.ref.valueChanges.subscribe(({ data }) => (this.deliveries = [...data.deliveries].sort(
      (a, b) => a.scheduledDate.localeCompare(b.scheduledDate))));
    this.apollo.watchQuery<{ orders: any[] }>({ query: ORDERS }).valueChanges
      .subscribe(({ data }) => (this.orders = data.orders));
  }

  open(): any[] { return this.deliveries.filter((d) => d.status !== 'DELIVERED' && d.status !== 'FAILED'); }
  closed(): any[] { return this.deliveries.filter((d) => d.status === 'DELIVERED' || d.status === 'FAILED'); }
  visible(): any[] { return this.tab === 'open' ? this.open() : this.tab === 'done' ? this.closed() : this.deliveries; }

  label(s: string): string { return DELIVERY_STATUS[s] ?? s; }
  slotLabel(s: string): string { return TIME_SLOT[s] ?? s; }
  deliveryTypeLabel = deliveryTypeLabel;
  fmtDate = fmtDate;
  /** Preferencia de entrega que el cliente eligió en su cotización. */
  orderPref(): string {
    const o = this.orders.find((x) => String(x.id) === String(this.form?.get('orderId')?.value));
    if (!o) return '';
    if (o.deliveryType === 'PICKUP') return 'recoge en el taller';
    const parts = ['envío a domicilio'];
    if (o.deliveryAddress) parts.push(`— ${o.deliveryAddress}`);
    if (o.deliveryLat) parts.push('(con GPS)');
    return parts.join(' ');
  }
  next(s: string): string[] { return NEXT[s] ?? []; }
  overdue(d: any): boolean {
    return d.status !== 'DELIVERED' && d.status !== 'FAILED' && d.scheduledDate < new Date().toISOString().slice(0, 10);
  }
  clientOf(orderId: string): string {
    return this.orders.find((o) => String(o.id) === String(orderId))?.client?.name ?? '—';
  }
  schedulableOrders(): any[] {
    const taken = new Set(this.deliveries.filter((d) => d.status !== 'FAILED' && d.status !== 'DELIVERED').map((d) => String(d.orderId)));
    return this.orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && !taken.has(String(o.id)));
  }

  actionsOf(d: any): ActionItem[] {
    const items: ActionItem[] = [];
    for (const s of this.next(d.status)) {
      items.push({
        label: s === 'FAILED' ? 'Marcar fallida' : `Marcar ${this.label(s).toLowerCase()}`,
        danger: s === 'FAILED',
        run: () => this.setStatus(d, s),
      });
    }
    if (d.status !== 'DELIVERED') {
      items.push({ label: 'Reprogramar fecha…', run: () => this.openReschedule(d) });
    }
    if (!items.length) items.push({ label: 'Sin acciones', disabled: true, run: () => {} });
    return items;
  }

  openSchedule(): void {
    this.form.reset({ orderId: '', scheduledDate: '', timeSlot: 'MORNING', deliveryType: 'DELIVERY', address: '', latitude: null, longitude: null, notes: '' });
    this.capacity = null;
    this.showSchedule = true;
    // Al elegir pedido → precargar la modalidad/GPS que pidió el cliente
    this.form.get('orderId')?.valueChanges.subscribe((id) => {
      const o = this.orders.find((x) => String(x.id) === String(id));
      if (!o) return;
      this.form.patchValue({
        deliveryType: o.deliveryType ?? 'DELIVERY',
        address: o.deliveryAddress ?? '',
        latitude: o.deliveryLat ?? null,
        longitude: o.deliveryLng ?? null,
      }, { emitEvent: false });
    });
  }

  checkCapacity(): void {
    const date = this.form.get('scheduledDate')?.value;
    if (!date) { this.capacity = null; return; }
    this.apollo.query<{ deliveryCapacity: number }>({ query: DELIVERY_CAPACITY, variables: { date }, fetchPolicy: 'network-only' })
      .subscribe({ next: ({ data }) => (this.capacity = data.deliveryCapacity), error: () => (this.capacity = null) });
  }

  async schedule(): Promise<void> {
    if (this.form.invalid || this.saving) return;
    const v = this.form.value;
    const order = this.orders.find((o) => String(o.id) === String(v.orderId));
    const ok = await this.confirm.ask({
      title: 'Programar entrega',
      message: `Pedido #${v.orderId} (${order?.client?.name ?? ''}) quedará programado para el ${fmtDate(v.scheduledDate)} en turno ${this.slotLabel(v.timeSlot).toLowerCase()}.`,
      confirmLabel: 'Programar',
    });
    if (!ok) return;
    this.saving = true;
    const input: any = { orderId: v.orderId, scheduledDate: v.scheduledDate, timeSlot: v.timeSlot, deliveryType: v.deliveryType };
    if (v.address) input.address = v.address;
    if (v.latitude != null && v.latitude !== '') input.latitude = Number(v.latitude);
    if (v.longitude != null && v.longitude !== '') input.longitude = Number(v.longitude);
    if (v.notes) input.notes = v.notes;
    this.apollo.mutate({ mutation: SCHEDULE_DELIVERY, variables: { input } }).subscribe({
      next: () => { this.toast.ok('Entrega programada'); this.showSchedule = false; this.ref?.refetch(); this.saving = false; },
      error: (e) => { this.toast.fromError(e); this.saving = false; },
    });
  }

  async setStatus(d: any, status: string): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Entrega #${d.orderId} → ${this.label(status)}`,
      message: `La entrega del pedido #${d.orderId} pasará a «${this.label(status)}».`,
      confirmLabel: 'Confirmar',
      danger: status === 'FAILED',
    });
    if (!ok) return;
    this.saving = true;
    this.apollo.mutate({ mutation: UPDATE_DELIVERY_STATUS, variables: { id: d.id, status } }).subscribe({
      next: () => { this.toast.ok(`Entrega #${d.id} → ${this.label(status)}`); this.ref?.refetch(); this.saving = false; },
      error: (e) => { this.toast.fromError(e); this.saving = false; },
    });
  }

  openReschedule(d: any): void { this.rescheduling = d; this.newDate = d.scheduledDate; }

  async doReschedule(): Promise<void> {
    if (!this.rescheduling || !this.newDate || this.saving) return;
    const ok = await this.confirm.ask({
      title: 'Reprogramar entrega',
      message: `La entrega del pedido #${this.rescheduling.orderId} pasará del ${fmtDate(this.rescheduling.scheduledDate)} al ${fmtDate(this.newDate)}.`,
      confirmLabel: 'Reprogramar',
    });
    if (!ok) return;
    this.saving = true;
    this.apollo.mutate({ mutation: RESCHEDULE_DELIVERY, variables: { id: this.rescheduling.id, newDate: this.newDate } }).subscribe({
      next: () => { this.toast.ok(`Entrega reprogramada al ${fmtDate(this.newDate)}`); this.rescheduling = null; this.ref?.refetch(); this.saving = false; },
      error: (e) => { this.toast.fromError(e); this.saving = false; },
    });
  }
}
