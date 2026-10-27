import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Apollo, QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';
import {
  ORDERS, CLIENTS, CARPENTERS, CREATE_ORDER, UPDATE_ORDER_STATUS,
  ASSIGN_CARPENTER, UPDATE_STEP_STATUS, LINK_QUOTATION, ORDER_STATUS_CHANGED,
} from '../graphql.operations';
import { ToastService } from '../toast.service';
import { ConfirmService } from '../confirm.service';
import { ActionsMenuComponent, ActionItem } from '../actions-menu.component';
import { ORDER_STATUS, STEP_STATUS, DELIVERY_STATUS, TIME_SLOT, fmtDate, fmtMoney } from '../labels';

/** Máquina de estados del dominio (OrderStatus.java). */
const NEXT: Record<string, string[]> = {
  PENDING: ['APPROVED', 'CANCELLED'],
  APPROVED: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['READY', 'CANCELLED'],
  READY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};
const NEXT_STEP: Record<string, string> = { PENDING: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED', COMPLETED: '' };
const WOOD_TYPES = ['PINO', 'CEDRO', 'ROBLE', 'MARA', 'MELAMINA', 'OTRO'];

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ActionsMenuComponent],
  template: `
    <div class="toolbar">
      <h2 class="sec" style="margin:0">Pedidos</h2>
      <div class="grow"></div>
      <button class="btn" (click)="openCreate()">+ Nuevo pedido</button>
    </div>

    <div class="chips">
      <button class="chip" [class.on]="!filter" (click)="filter = ''">Todos ({{ orders.length }})</button>
      <button class="chip" *ngFor="let s of statuses" [class.on]="filter === s" (click)="filter = s">
        {{ label(s) }} ({{ countOf(s) }})
      </button>
    </div>

    <div class="card">
      <table>
        <thead><tr><th>Cliente</th><th>Descripción</th><th>Estado</th><th>Total</th><th>Entrega</th><th>Carpinteros</th><th style="width:60px"></th></tr></thead>
        <tbody>
          <tr *ngFor="let o of filtered()">
            <td><strong>{{ o.client?.name }}</strong> <span style="color:#a89a8c;font-size:11px">#{{ o.id }}</span></td>
            <td>{{ o.description || '—' }}</td>
            <td><span class="badge" [class]="'badge st-' + o.status">{{ label(o.status) }}</span></td>
            <td>Bs. {{ fmtMoney(o.totalPrice) }}</td>
            <td>{{ fmtDate(o.delivery?.scheduledDate || o.deliveryDate) }}</td>
            <td>{{ carpenterNames(o) }}</td>
            <td><app-actions-menu [items]="actionsOf(o)" /></td>
          </tr>
          <tr *ngIf="!filtered().length"><td colspan="7" class="empty-note">Sin pedidos en este estado.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modal detalle / gestión -->
    @if (detail) {
      <div class="modal-backdrop" (click)="detail = null">
        <div class="modal" style="width:min(720px,96vw)" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <h3>Pedido #{{ detail.id }} — {{ detail.client?.name }}</h3>
            <button class="modal-x" (click)="detail = null">×</button>
          </div>
          <div class="modal-body">
            <p style="margin-top:0">
              <span class="badge" [class]="'badge st-' + detail.status" style="font-size:13px">{{ label(detail.status) }}</span>
              &nbsp;Total: <strong>Bs. {{ fmtMoney(detail.totalPrice) }}</strong>
              &nbsp;· Entrega: {{ detail.delivery ? fmtDate(detail.delivery.scheduledDate) : (detail.deliveryDate ? fmtDate(detail.deliveryDate) : 'sin programar') }}
            </p>

            <!-- Cambio de estado (solo transiciones válidas) -->
            <h3 class="sub">Cambiar estado</h3>
            <div class="row-actions" style="margin-bottom:16px">
              <span class="empty-note" *ngIf="!nextStates(detail.status).length" style="padding:0">Estado final — sin transiciones.</span>
              <button class="icon-btn" *ngFor="let s of nextStates(detail.status)"
                      [class.warn]="s === 'CANCELLED'" [class.go]="s === 'DELIVERED'"
                      (click)="setStatus(detail, s)" [disabled]="saving">
                → {{ label(s) }}
              </button>
            </div>

            <!-- Items -->
            <h3 class="sub">Ítems ({{ detail.items?.length || 0 }})</h3>
            <table *ngIf="detail.items?.length" style="margin-bottom:16px">
              <thead><tr><th>Descripción</th><th>Tipo</th><th>Madera</th><th>Cant.</th><th>P. unit.</th></tr></thead>
              <tbody>
                <tr *ngFor="let it of detail.items">
                  <td>{{ it.description }}</td><td>{{ it.furnitureType || '—' }}</td><td>{{ it.woodType || '—' }}</td>
                  <td>{{ it.quantity }}</td><td>Bs. {{ it.unitPrice }}</td>
                </tr>
              </tbody>
            </table>
            <p *ngIf="!detail.items?.length" class="empty-note">Sin ítems registrados.</p>

            <!-- Pasos de producción -->
            <h3 class="sub">Pasos de producción</h3>
            <table *ngIf="detail.steps?.length" style="margin-bottom:16px">
              <thead><tr><th>#</th><th>Paso</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                <tr *ngFor="let st of detail.steps">
                  <td>{{ st.sequence }}</td><td>{{ st.name }}</td>
                  <td><span class="badge" [class]="'badge st-' + st.status">{{ stepLabel(st.status) }}</span></td>
                  <td>
                    <button class="icon-btn go" *ngIf="nextStep(st.status)" (click)="advanceStep(st)" [disabled]="saving">
                      → {{ stepLabel(nextStep(st.status)) }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p *ngIf="!detail.steps?.length" class="empty-note">Sin pasos de producción.</p>

            <!-- Carpinteros asignados -->
            <h3 class="sub">Carpinteros</h3>
            <p style="margin:4px 0 8px;font-size:13px">
              Asignados: <strong>{{ carpenterNames(detail, 'ninguno') }}</strong>
            </p>
            <div style="display:flex;gap:8px;margin-bottom:16px">
              <select [(ngModel)]="assignee" style="flex:1">
                <option [ngValue]="null">Seleccionar carpintero…</option>
                <option *ngFor="let c of activeCarpenters" [ngValue]="c.id">{{ c.name }} ({{ c.specialty }})</option>
              </select>
              <button class="btn btn-sm" (click)="assign()" [disabled]="!assignee || saving">Asignar</button>
            </div>

            <!-- Entrega -->
            <h3 class="sub">Entrega</h3>
            @if (detail.delivery) {
              <p style="font-size:13px;margin:4px 0">
                Programada: <strong>{{ fmtDate(detail.delivery.scheduledDate) }}</strong> · {{ slotLabel(detail.delivery.timeSlot) }}
                · <span class="badge" [class]="'badge st-' + detail.delivery.status">{{ deliveryLabel(detail.delivery.status) }}</span>
                · {{ detail.delivery.address || 'sin dirección' }}
              </p>
            } @else {
              <p class="empty-note" style="margin:4px 0">Sin entrega programada — gestiónala desde la sección Entregas.</p>
            }

            <!-- Vincular cotización -->
            <h3 class="sub" style="margin-top:16px">Vincular cotización</h3>
            <div style="display:flex;gap:8px">
              <input [(ngModel)]="quotationId" placeholder="ID de cotización" style="flex:1" />
              <button class="btn btn-sm btn-ghost" (click)="link()" [disabled]="!quotationId.trim() || saving">Vincular</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal nuevo pedido -->
    @if (showCreate) {
      <div class="modal-backdrop" (click)="showCreate = false">
        <div class="modal" style="width:min(720px,96vw)" (click)="$event.stopPropagation()">
          <div class="modal-head"><h3>Nuevo pedido</h3><button class="modal-x" (click)="showCreate = false">×</button></div>
          <form [formGroup]="createForm" (ngSubmit)="create()">
            <div class="modal-body">
              <div class="form-grid" style="margin-bottom:14px">
                <label class="f">Cliente *
                  <select formControlName="clientId">
                    <option value="" disabled>Seleccionar…</option>
                    <option *ngFor="let c of clients" [value]="c.id">{{ c.name }}</option>
                  </select>
                </label>
                <label class="f">Descripción<input formControlName="description" placeholder="Ej.: Ropero 3 puertas de cedro" /></label>
              </div>
              <h3 class="sub">Ítems</h3>
              <div formArrayName="items">
                <div *ngFor="let g of items.controls; let i = index" [formGroupName]="i"
                     style="display:grid;grid-template-columns:2fr 1fr 1fr .6fr .8fr auto;gap:8px;margin-bottom:8px;align-items:center">
                  <input formControlName="description" placeholder="Descripción *" />
                  <input formControlName="furnitureType" placeholder="Tipo mueble" />
                  <select formControlName="woodType"><option *ngFor="let w of woods" [value]="w">{{ w }}</option></select>
                  <input formControlName="quantity" type="number" min="1" placeholder="Cant." />
                  <input formControlName="unitPrice" type="number" min="0" step="0.5" placeholder="P. unit." />
                  <button type="button" class="icon-btn warn" (click)="items.removeAt(i)" *ngIf="items.length > 1">×</button>
                </div>
              </div>
              <button type="button" class="btn btn-ghost btn-sm" (click)="addItem()">+ Agregar ítem</button>
            </div>
            <div class="modal-foot">
              <button type="button" class="btn btn-ghost" (click)="showCreate = false">Cancelar</button>
              <button type="submit" class="btn" [disabled]="createForm.invalid || saving">{{ saving ? 'Creando…' : 'Crear pedido' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  clients: any[] = [];
  activeCarpenters: any[] = [];
  statuses = Object.keys(NEXT);
  filter = '';
  detail: any = null;
  showCreate = false;
  saving = false;
  assignee: string | null = null;
  quotationId = '';
  woods = WOOD_TYPES;
  createForm: FormGroup;
  private ref?: QueryRef<{ orders: any[] }>;
  private subs: Subscription[] = [];

  constructor(
    private apollo: Apollo, private fb: FormBuilder,
    private toast: ToastService, private confirm: ConfirmService,
  ) {
    this.createForm = fb.group({
      clientId: ['', Validators.required],
      description: [''],
      items: fb.array([]),
    });
  }

  get items(): FormArray { return this.createForm.get('items') as FormArray; }

  ngOnInit(): void {
    this.ref = this.apollo.watchQuery<{ orders: any[] }>({ query: ORDERS });
    this.subs.push(
      this.ref.valueChanges.subscribe(({ data }) => {
        this.orders = data.orders;
        if (this.detail) this.detail = this.orders.find((o) => o.id === this.detail.id) ?? null;
      }),
      this.apollo.watchQuery<{ clients: any[] }>({ query: CLIENTS }).valueChanges
        .subscribe(({ data }) => (this.clients = data.clients)),
      this.apollo.watchQuery<{ carpenters: any[] }>({ query: CARPENTERS }).valueChanges
        .subscribe(({ data }) => (this.activeCarpenters = data.carpenters.filter((c) => c.active))),
      this.apollo.subscribe<{ orderStatusChanged: { id: string; status: string } }>({ query: ORDER_STATUS_CHANGED })
        .subscribe(({ data }) => {
          const ev = data?.orderStatusChanged;
          if (ev) { this.toast.info(`Pedido #${ev.id} → ${this.label(ev.status)}`); this.ref?.refetch(); }
        }),
    );
  }

  ngOnDestroy(): void { this.subs.forEach((s) => s.unsubscribe()); }

  filtered(): any[] { return this.filter ? this.orders.filter((o) => o.status === this.filter) : this.orders; }
  countOf(s: string): number { return this.orders.filter((o) => o.status === s).length; }
  label(s: string): string { return ORDER_STATUS[s] ?? s; }
  stepLabel(s: string): string { return STEP_STATUS[s] ?? s; }
  deliveryLabel(s: string): string { return DELIVERY_STATUS[s] ?? s; }
  nextStates(s: string): string[] { return NEXT[s] ?? []; }
  nextStep(s: string): string { return NEXT_STEP[s] ?? ''; }
  slotLabel(s: string): string { return TIME_SLOT[s] ?? s; }
  fmtDate = fmtDate;
  fmtMoney = fmtMoney;
  carpenterNames(o: any, empty = '—'): string {
    return o?.carpenters?.length ? o.carpenters.map((x: any) => x.name).join(', ') : empty;
  }

  /** ⋮ menú por fila: gestionar + transiciones válidas. */
  actionsOf(o: any): ActionItem[] {
    const items: ActionItem[] = [
      { label: 'Ver / gestionar', run: () => this.openDetail(o) },
    ];
    for (const s of this.nextStates(o.status)) {
      items.push({
        label: s === 'CANCELLED' ? 'Cancelar pedido' : `Marcar ${this.label(s).toLowerCase()}`,
        danger: s === 'CANCELLED',
        run: () => this.setStatus(o, s),
      });
    }
    return items;
  }

  openDetail(o: any): void {
    this.detail = o;
    this.assignee = null;
    this.quotationId = '';
  }

  async setStatus(o: any, status: string): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Pedido #${o.id} → ${this.label(status)}`,
      message: status === 'CANCELLED'
        ? 'El pedido quedará cancelado y no podrá avanzar.'
        : `El pedido pasará a estado «${this.label(status)}».`,
      confirmLabel: 'Confirmar',
      danger: status === 'CANCELLED',
    });
    if (!ok) return;
    this.saving = true;
    this.apollo.mutate({ mutation: UPDATE_ORDER_STATUS, variables: { id: o.id, status } }).subscribe({
      next: () => { this.toast.ok(`Pedido #${o.id} → ${this.label(status)}`); this.ref?.refetch(); this.saving = false; },
      error: (e) => { this.toast.fromError(e); this.saving = false; },
    });
  }

  async assign(): Promise<void> {
    if (!this.assignee || !this.detail) return;
    const c = this.activeCarpenters.find((x) => x.id === this.assignee);
    const ok = await this.confirm.ask({
      title: 'Asignar carpintero',
      message: `Se asignará a ${c?.name ?? ''} al pedido #${this.detail.id}.`,
      confirmLabel: 'Asignar',
    });
    if (!ok) return;
    this.saving = true;
    this.apollo.mutate({ mutation: ASSIGN_CARPENTER, variables: { orderId: this.detail.id, carpenterId: this.assignee } }).subscribe({
      next: () => { this.toast.ok('Carpintero asignado'); this.assignee = null; this.ref?.refetch(); this.saving = false; },
      error: (e) => { this.toast.fromError(e); this.saving = false; },
    });
  }

  async advanceStep(st: any): Promise<void> {
    const status = this.nextStep(st.status);
    if (!status) return;
    const ok = await this.confirm.ask({
      title: 'Avanzar paso',
      message: `«${st.name}» pasará a ${this.stepLabel(status).toLowerCase()}.`,
      confirmLabel: 'Confirmar',
    });
    if (!ok) return;
    this.saving = true;
    this.apollo.mutate({ mutation: UPDATE_STEP_STATUS, variables: { stepId: st.id, status } }).subscribe({
      next: () => { this.toast.ok(`Paso "${st.name}" → ${this.stepLabel(status)}`); this.ref?.refetch(); this.saving = false; },
      error: (e) => { this.toast.fromError(e); this.saving = false; },
    });
  }

  async link(): Promise<void> {
    if (!this.detail || !this.quotationId.trim()) return;
    const ok = await this.confirm.ask({
      title: 'Vincular cotización',
      message: `Se vinculará la cotización ${this.quotationId.trim()} al pedido #${this.detail.id}.`,
      confirmLabel: 'Vincular',
    });
    if (!ok) return;
    this.saving = true;
    this.apollo.mutate({ mutation: LINK_QUOTATION, variables: { orderId: this.detail.id, quotationId: this.quotationId.trim() } }).subscribe({
      next: () => { this.toast.ok('Cotización vinculada'); this.quotationId = ''; this.ref?.refetch(); this.saving = false; },
      error: (e) => { this.toast.fromError(e); this.saving = false; },
    });
  }

  openCreate(): void {
    this.createForm.reset({ clientId: '', description: '' });
    this.items.clear();
    this.addItem();
    this.showCreate = true;
  }

  addItem(): void {
    this.items.push(this.fb.group({
      description: ['', Validators.required],
      furnitureType: [''],
      woodType: ['PINO'],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.min(0)]],
    }));
  }

  async create(): Promise<void> {
    if (this.createForm.invalid || this.saving) return;
    const ok = await this.confirm.ask({
      title: 'Crear pedido',
      message: `Se registrará el pedido para el cliente seleccionado con ${this.items.length} ítem(s).`,
      confirmLabel: 'Crear',
    });
    if (!ok) return;
    this.saving = true;
    const v = this.createForm.value;
    const input: any = {
      clientId: v.clientId,
      description: v.description || null,
      items: v.items.map((it: any) => ({
        description: it.description,
        furnitureType: it.furnitureType || null,
        woodType: it.woodType,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
      })),
    };
    this.apollo.mutate({ mutation: CREATE_ORDER, variables: { input } }).subscribe({
      next: () => { this.toast.ok('Pedido creado'); this.showCreate = false; this.ref?.refetch(); this.saving = false; },
      error: (e) => { this.toast.fromError(e); this.saving = false; },
    });
  }
}
