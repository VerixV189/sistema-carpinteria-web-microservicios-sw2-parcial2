import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Apollo, QueryRef } from 'apollo-angular';
import { CLIENTS, CREATE_CLIENT, UPDATE_CLIENT, DELETE_CLIENT } from '../graphql.operations';
import { ApiService, ClientCluster } from '../api.service';
import { ToastService } from '../toast.service';
import { ConfirmService } from '../confirm.service';
import { ActionsMenuComponent, ActionItem } from '../actions-menu.component';

const SEGMENTS = ['REGULAR', 'VIP', 'WHOLESALE'];

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ActionsMenuComponent],
  template: `
    <div class="toolbar">
      <h2 class="sec" style="margin:0">Clientes y Segmentación IA (CU1)</h2>
      <div class="grow"></div>
      <input [(ngModel)]="search" placeholder="Buscar nombre o email…" style="width:230px" />
      <button class="btn btn-ghost" (click)="runClustering()" [disabled]="clustering">
        {{ clustering ? 'Segmentando con IA…' : 'Segmentar con IA (X-Means)' }}
      </button>
      <button class="btn" (click)="openForm()">+ Nuevo cliente</button>
    </div>

    @if (clusters.length) {
      <div class="card" style="margin-bottom:14px;background:#FAF7F2;border:1px solid #EDE4D8">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <strong style="color:#3B2F2F">Resultado de Segmentación IA ({{ clusterAlgorithm }})</strong>
          <button class="btn btn-ghost" style="padding:4px 10px;font-size:12px" (click)="clusters = []">Ocultar</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px">
          @for (cl of clusters; track cl.clusterId) {
            <div style="background:#fff;padding:12px 14px;border-radius:10px;border:1px solid #EDE4D8">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <strong style="color:#8B5A2B">{{ cl.label }}</strong>
                <span class="badge st-READY">{{ cl.size }} cliente(s)</span>
              </div>
              @if (cl.centroid) {
                <div style="font-size:12px;color:#6d6157;margin-bottom:6px">
                  Promedio: {{ cl.centroid.total_orders ?? 0 }} pedidos · Bs {{ cl.centroid.total_spent ?? 0 }}
                </div>
              }
              <div style="font-size:12px;color:#3B2F2F">
                <b>Clientes:</b> {{ clientNamesForCluster(cl) }}
              </div>
            </div>
          }
        </div>
      </div>
    }

    <div class="card">
      <table>
        <thead><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Dirección</th><th>Segmento</th><th style="width:60px"></th></tr></thead>
        <tbody>
          <tr *ngFor="let c of filtered()">
            <td><strong>{{ c.name }}</strong></td>
            <td>{{ c.email }}</td>
            <td>{{ c.phone || '—' }}</td>
            <td>{{ c.address || '—' }}</td>
            <td><span class="badge" [class]="'badge ' + (c.segment === 'VIP' ? 'st-READY' : c.segment === 'WHOLESALE' ? 'st-QUOTED' : 'st-DRAFT')">{{ c.segment || 'REGULAR' }}</span></td>
            <td><app-actions-menu [items]="actionsOf(c)" /></td>
          </tr>
          <tr *ngIf="!filtered().length"><td colspan="6" class="empty-note">Sin resultados.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modal crear / editar -->
    @if (showForm) {
      <div class="modal-backdrop" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-head"><h3>{{ editing ? 'Editar cliente' : 'Nuevo cliente' }}</h3><button class="modal-x" (click)="closeForm()">×</button></div>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="modal-body form-grid">
              <label class="f full">Nombre *<input formControlName="name" /></label>
              <label class="f">Email *<input formControlName="email" type="email" /></label>
              <label class="f">Teléfono<input formControlName="phone" /></label>
              <label class="f">Dirección<input formControlName="address" /></label>
              <label class="f">Segmento
                <select formControlName="segment">
                  <option *ngFor="let s of segments" [value]="s">{{ s }}</option>
                </select>
              </label>
            </div>
            <div class="modal-foot">
              <button type="button" class="btn btn-ghost" (click)="closeForm()">Cancelar</button>
              <button type="submit" class="btn" [disabled]="form.invalid || saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ClientsComponent implements OnInit {
  clients: any[] = [];
  segments = SEGMENTS;
  search = '';
  form: FormGroup;
  showForm = false;
  editing: any = null;
  saving = false;
  clustering = false;
  clusterAlgorithm = 'X-Means';
  clusters: ClientCluster[] = [];
  private ref?: QueryRef<{ clients: any[] }>;

  constructor(
    private apollo: Apollo, fb: FormBuilder,
    private api: ApiService,
    private toast: ToastService, private confirm: ConfirmService,
  ) {
    this.form = fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      segment: ['REGULAR'],
    });
  }

  ngOnInit(): void {
    this.ref = this.apollo.watchQuery<{ clients: any[] }>({ query: CLIENTS });
    this.ref.valueChanges.subscribe(({ data }) => (this.clients = data.clients));
  }

  filtered(): any[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.clients;
    return this.clients.filter((c) => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
  }

  async runClustering(): Promise<void> {
    this.clustering = true;
    try {
      const res = await this.api.clusterClients();
      this.clusterAlgorithm = res.algorithm || 'X-Means (K-Means + silhouette)';
      this.clusters = res.clusters ?? [];
      this.toast.ok(`Segmentación IA completada (${this.clusters.length} grupos)`);
    } catch (e) {
      this.toast.fromError(e, 'No se pudo ejecutar la segmentación IA');
    } finally {
      this.clustering = false;
    }
  }

  clientNamesForCluster(cl: ClientCluster): string {
    if (!cl.clientIds?.length) return 'Ninguno';
    const names = cl.clientIds.map((id) => {
      const found = this.clients.find((c) => String(c.id) === String(id));
      return found ? found.name : `#${id}`;
    });
    return names.join(', ');
  }

  actionsOf(c: any): ActionItem[] {
    return [
      { label: 'Editar', run: () => this.openForm(c) },
      { label: 'Eliminar', danger: true, run: () => this.delete(c) },
    ];
  }

  openForm(c?: any): void {
    this.editing = c ?? null;
    this.form.reset(c ? { name: c.name, email: c.email, phone: c.phone, address: c.address, segment: c.segment ?? 'REGULAR' }
                       : { segment: 'REGULAR' });
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; this.editing = null; }

  async save(): Promise<void> {
    if (this.form.invalid || this.saving) return;
    const name = this.form.value.name;
    const ok = await this.confirm.ask({
      title: this.editing ? 'Guardar cambios' : 'Crear cliente',
      message: this.editing ? `Se actualizarán los datos de ${this.editing.name}.` : `Se registrará al cliente ${name}.`,
      confirmLabel: 'Guardar',
    });
    if (!ok) return;
    this.saving = true;
    const input = Object.fromEntries(Object.entries(this.form.value).filter(([, v]) => v !== '' && v !== null));
    const obs = this.editing
      ? this.apollo.mutate({ mutation: UPDATE_CLIENT, variables: { id: this.editing.id, input } })
      : this.apollo.mutate({ mutation: CREATE_CLIENT, variables: { input } });
    obs.subscribe({
      next: () => { this.toast.ok(this.editing ? 'Cliente actualizado' : 'Cliente registrado'); this.closeForm(); this.ref?.refetch(); this.saving = false; },
      error: (e) => { this.toast.fromError(e); this.saving = false; },
    });
  }

  async delete(c: any): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Eliminar cliente',
      message: `Se eliminará a ${c.name}. Fallará si tiene pedidos asociados.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    this.apollo.mutate({ mutation: DELETE_CLIENT, variables: { id: c.id } }).subscribe({
      next: () => { this.toast.ok('Cliente eliminado'); this.ref?.refetch(); },
      error: (e) => this.toast.fromError(e, 'No se pudo eliminar'),
    });
  }
}
