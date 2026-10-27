import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Quotation } from '../api.service';
import { ToastService } from '../toast.service';
import { ConfirmService } from '../confirm.service';
import { ActionsMenuComponent, ActionItem } from '../actions-menu.component';
import { QUOTATION_STATUS, deliveryTypeLabel, fmtDate, fmtMoney } from '../labels';

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [CommonModule, FormsModule, ActionsMenuComponent],
  template: `
    <div class="toolbar">
      <h2 class="sec" style="margin:0">Cotizaciones</h2>
      <div class="grow"></div>
      <button class="btn btn-ghost btn-sm" (click)="load()">Actualizar</button>
    </div>

    <div class="chips">
      <button class="chip" [class.on]="!filter" (click)="filter = ''">Todas ({{ list.length }})</button>
      <button class="chip" *ngFor="let s of statuses" [class.on]="filter === s" (click)="filter = s">
        {{ label(s) }} ({{ countOf(s) }})
      </button>
    </div>

    <p *ngIf="loading" class="card empty-note">Cargando cotizaciones…</p>
    <p *ngIf="error" class="card" style="color:#b03434">{{ error }}</p>

    <div class="card" *ngIf="!loading">
      <table>
        <thead><tr><th>Cliente</th><th>Estado</th><th>Precio</th><th>Entrega</th><th>Ítems</th><th>Creada</th><th style="width:60px"></th></tr></thead>
        <tbody>
          <ng-container *ngFor="let q of filtered()">
            <tr>
              <td><strong>{{ q.clientId }}</strong></td>
              <td>
                <span class="badge" [class]="'badge st-' + q.status">{{ label(q.status) }}</span>
                <div *ngIf="q.clientMessage && q.status === 'DRAFT'"
                     style="font-size:12px;color:#B4690E;margin-top:4px;max-width:280px">
                  Cliente propone{{ q.counterAmount ? ' Bs. ' + fmtMoney(q.counterAmount) : '' }}:
                  «{{ q.clientMessage }}»
                </div>
              </td>
              <td>
                Bs. {{ fmtMoney(q.finalAmount ?? q.totalAmount) }}
                <div *ngIf="q.finalAmount != null && q.finalAmount !== q.totalAmount"
                     style="font-size:11px;color:#8a7f75">est. Bs. {{ fmtMoney(q.totalAmount) }}</div>
              </td>
              <td style="font-size:12.5px;color:#5c534a">
                {{ deliveryLabel(q) }}
                <a *ngIf="q.delivery?.lat && q.delivery?.lng" target="_blank" rel="noopener"
                   [href]="'https://www.google.com/maps?q=' + q.delivery!.lat + ',' + q.delivery!.lng"
                   style="color:#1a5276;display:block">ver mapa</a>
              </td>
              <td>{{ q.items.length }}</td>
              <td>{{ fmtDate(q.createdAt) }}</td>
              <td><app-actions-menu [items]="actionsOf(q)" /></td>
            </tr>
            <tr *ngIf="expanded === q.id">
              <td colspan="7" style="background:#FCFAF7">
                <p style="margin:0 0 8px;font-size:12px;color:#8a7f75">ID: {{ q.id }}</p>
                <p *ngIf="q.delivery" style="margin:0 0 8px;font-size:12.5px;color:#5c534a">
                  Entrega: <strong>{{ deliveryLabel(q) }}</strong>
                  <span *ngIf="q.delivery?.address"> — {{ q.delivery!.address }}</span>
                  <span *ngIf="q.delivery?.lat"> (GPS: {{ q.delivery!.lat }}, {{ q.delivery!.lng }})</span>
                </p>
                <table>
                  <thead><tr><th>Descripción</th><th>Tipo</th><th>Madera</th><th>Dimensiones</th><th>Cant.</th><th>P. unit.</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let it of q.items">
                      <td>{{ it.description }}</td><td>{{ it.furnitureType }}</td><td>{{ it.woodType }}</td>
                      <td>{{ dims(it) }}</td><td>{{ it.quantity }}</td><td>Bs. {{ fmtMoney(it.unitPrice) }}</td><td>Bs. {{ fmtMoney(it.subtotal) }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </ng-container>
          <tr *ngIf="!filtered().length"><td colspan="7" class="empty-note">Sin cotizaciones en este estado.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modal enviar precio formal al cliente -->
    @if (sending) {
      <div class="modal-backdrop" (click)="sending = null">
        <div class="modal" style="width:min(440px,94vw)" (click)="$event.stopPropagation()">
          <div class="modal-head"><h3>Enviar precio al cliente</h3><button class="modal-x" (click)="sending = null">×</button></div>
          <div class="modal-body">
            <p style="margin-top:0;font-size:13px">
              El cliente <strong>{{ sending.clientId }}</strong> recibirá este precio y podrá
              <strong>aceptarlo, proponer otro o rechazarlo</strong>.
            </p>
            <div *ngIf="sending.clientMessage" class="card" style="background:#FDF3E3;border-left:3px solid #B4690E;padding:10px 12px;font-size:13px;margin-bottom:12px">
              El cliente escribió: «{{ sending.clientMessage }}»
              <div *ngIf="sending.counterAmount" style="font-weight:700;margin-top:4px">Propone: Bs. {{ fmtMoney(sending.counterAmount) }}</div>
            </div>
            <label class="f">Precio final (Bs.)
              <input [(ngModel)]="sendAmount" type="number" min="0" />
            </label>
            <p style="font-size:12px;color:#8a7f75">Estimado de referencia: Bs. {{ fmtMoney(sending.totalAmount) }}</p>
          </div>
          <div class="modal-foot">
            <button class="btn btn-ghost" (click)="sending = null">Cancelar</button>
            <button class="btn" (click)="send()" [disabled]="saving || sendAmount === ''">{{ saving ? 'Enviando…' : 'Enviar precio' }}</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal aprobar (vincular a pedido opcional) -->
    @if (approving) {
      <div class="modal-backdrop" (click)="approving = null">
        <div class="modal" style="width:min(440px,94vw)" (click)="$event.stopPropagation()">
          <div class="modal-head"><h3>Aprobar cotización</h3><button class="modal-x" (click)="approving = null">×</button></div>
          <div class="modal-body">
            <p style="margin-top:0;font-size:13px">
              Cotización de <strong>{{ approving.clientId }}</strong> por <strong>Bs. {{ fmtMoney(approving.totalAmount) }}</strong>.
              Al aprobar se publica el evento <code>quotation.approved</code> y el pedido vinculado avanza.
            </p>
            <label class="f">ID de pedido a vincular (opcional)
              <input [(ngModel)]="orderId" type="number" min="1" placeholder="Ej.: 6" />
            </label>
          </div>
          <div class="modal-foot">
            <button class="btn btn-ghost" (click)="approving = null">Cancelar</button>
            <button class="btn" (click)="approve()" [disabled]="saving">{{ saving ? 'Aprobando…' : 'Confirmar aprobación' }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class QuotationsComponent implements OnInit {
  list: Quotation[] = [];
  statuses = ['DRAFT', 'QUOTED', 'APPROVED', 'REJECTED', 'CONVERTED'];
  filter = '';
  expanded: string | null = null;
  approving: Quotation | null = null;
  orderId = '';
  sending: Quotation | null = null;
  sendAmount: number | '' = '';
  loading = true;
  saving = false;
  error = '';

  constructor(private api: ApiService, private toast: ToastService, private confirm: ConfirmService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.quotations()
      .then((q) => { this.list = q.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')); this.loading = false; })
      .catch((e) => { this.error = `No se pudieron cargar las cotizaciones: ${e.message}`; this.loading = false; });
  }

  filtered(): Quotation[] { return this.filter ? this.list.filter((q) => q.status === this.filter) : this.list; }
  countOf(s: string): number { return this.list.filter((q) => q.status === s).length; }
  label(s: string): string { return QUOTATION_STATUS[s] ?? s; }
  fmtDate = fmtDate;
  fmtMoney = fmtMoney;
  deliveryLabel(q: Quotation): string { return deliveryTypeLabel(q.delivery?.type); }
  canDecide(q: Quotation): boolean { return q.status === 'DRAFT' || q.status === 'QUOTED'; }
  dims(it: { dimensions?: { lengthM: number; widthM: number; heightM: number } }): string {
    const d = it.dimensions;
    return d ? `${d.lengthM}×${d.widthM}×${d.heightM} m` : '—';
  }

  actionsOf(q: Quotation): ActionItem[] {
    const items: ActionItem[] = [
      { label: this.expanded === q.id ? 'Ocultar detalle' : 'Ver detalle', run: () => (this.expanded = this.expanded === q.id ? null : q.id) },
    ];
    if (this.canDecide(q)) {
      items.push(
        { label: 'Enviar precio al cliente…', run: () => this.openSend(q) },
        { label: 'Aprobar directo…', run: () => this.openApprove(q) },
        { label: 'Rechazar', danger: true, run: () => this.reject(q) },
      );
    }
    return items;
  }

  openSend(q: Quotation): void {
    this.sending = q;
    this.sendAmount = q.counterAmount ?? q.finalAmount ?? q.totalAmount;
  }

  async send(): Promise<void> {
    if (!this.sending || this.saving || this.sendAmount === '') return;
    const amount = Number(this.sendAmount);
    const ok = await this.confirm.ask({
      title: 'Enviar precio al cliente',
      message: `Se enviará a ${this.sending.clientId} el precio Bs. ${fmtMoney(amount)}. El cliente podrá aceptarlo, proponer otro o rechazarlo.`,
      confirmLabel: 'Enviar precio',
    });
    if (!ok) return;
    this.saving = true;
    this.api.sendQuotation(this.sending.id, amount)
      .then(() => { this.toast.ok('Precio enviado al cliente'); this.sending = null; this.load(); this.saving = false; })
      .catch((e) => { this.toast.err(e.message); this.saving = false; });
  }

  openApprove(q: Quotation): void { this.approving = q; this.orderId = ''; }

  approve(): void {
    if (!this.approving || this.saving) return;
    this.saving = true;
    const oid = this.orderId ? Number(this.orderId) : undefined;
    this.api.approveQuotation(this.approving.id, oid)
      .then(() => { this.toast.ok('Cotización aprobada'); this.approving = null; this.load(); this.saving = false; })
      .catch((e) => { this.toast.err(e.message); this.saving = false; });
  }

  async reject(q: Quotation): Promise<void> {
    if (this.saving) return;
    const ok = await this.confirm.ask({
      title: 'Rechazar cotización',
      message: `Se rechazará la cotización de ${q.clientId} por Bs. ${fmtMoney(q.totalAmount)}.`,
      confirmLabel: 'Rechazar',
      danger: true,
    });
    if (!ok) return;
    this.saving = true;
    this.api.rejectQuotation(q.id)
      .then(() => { this.toast.ok('Cotización rechazada'); this.load(); this.saving = false; })
      .catch((e) => { this.toast.err(e.message); this.saving = false; });
  }
}
