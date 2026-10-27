import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo, QueryRef } from 'apollo-angular';
import { CARPENTERS, CREATE_CARPENTER, UPDATE_CARPENTER, DELETE_CARPENTER, CARPENTER_WORKLOAD } from '../graphql.operations';
import { ToastService } from '../toast.service';
import { ConfirmService } from '../confirm.service';
import { ActionsMenuComponent, ActionItem } from '../actions-menu.component';
import { orderLabel, fmtDate } from '../labels';

const SPECIALTIES: [string, string][] = [
  ['GENERAL', 'General'],
  ['MUEBLES', 'Muebles'],
  ['COCINAS', 'Cocinas'],
  ['PUERTAS_VENTANAS', 'Puertas y ventanas'],
  ['RESTAURACION', 'Restauración'],
  ['TALLER_FINO', 'Taller fino'],
];

@Component({
  selector: 'app-carpenters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionsMenuComponent],
  template: `
    <div class="toolbar">
      <h2 class="sec" style="margin:0">Carpinteros</h2>
      <div class="grow"></div>
      <button class="btn" (click)="openForm()">+ Nuevo carpintero</button>
    </div>

    <div class="card">
      <table>
        <thead><tr><th>Nombre</th><th>Email</th><th>Especialidad</th><th>Experiencia</th><th>Bs./h</th><th>Estado</th><th style="width:60px"></th></tr></thead>
        <tbody>
          <tr *ngFor="let c of carpenters">
            <td><strong>{{ c.name }}</strong></td>
            <td>{{ c.email }}</td>
            <td>{{ specialtyLabel(c.specialty) }}</td>
            <td>{{ c.yearsExperience }} años</td>
            <td>{{ c.hourlyRate }}</td>
            <td><span class="badge" [class]="'badge ' + (c.active ? 'st-DELIVERED' : 'off')">{{ c.active ? 'Activo' : 'Inactivo' }}</span></td>
            <td><app-actions-menu [items]="actionsOf(c)" /></td>
          </tr>
          <tr *ngIf="!carpenters.length"><td colspan="7" class="empty-note">Sin carpinteros registrados.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modal crear / editar -->
    @if (showForm) {
      <div class="modal-backdrop" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-head"><h3>{{ editing ? 'Editar carpintero' : 'Nuevo carpintero' }}</h3><button class="modal-x" (click)="closeForm()">×</button></div>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="modal-body form-grid">
              <label class="f full">Nombre *<input formControlName="name" /></label>
              <label class="f">Email *<input formControlName="email" type="email" /></label>
              <label class="f">Teléfono<input formControlName="phone" /></label>
              <label class="f">Especialidad
                <select formControlName="specialty">
                  <option *ngFor="let s of specialties" [value]="s[0]">{{ s[1] }}</option>
                </select>
              </label>
              <label class="f">Años de experiencia<input formControlName="yearsExperience" type="number" min="0" /></label>
              <label class="f">Tarifa por hora (Bs.)<input formControlName="hourlyRate" type="number" min="0" step="0.5" /></label>
            </div>
            <div class="modal-foot">
              <button type="button" class="btn btn-ghost" (click)="closeForm()">Cancelar</button>
              <button type="submit" class="btn" [disabled]="form.invalid || saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal carga de trabajo -->
    @if (workloadFor) {
      <div class="modal-backdrop" (click)="workloadFor = null">
        <div class="modal" style="width:min(480px,94vw)" (click)="$event.stopPropagation()">
          <div class="modal-head"><h3>Carga de {{ workloadFor.name }}</h3><button class="modal-x" (click)="workloadFor = null">×</button></div>
          <div class="modal-body">
            @if (workloadLoading) { <p class="empty-note">Cargando…</p> }
            @if (!workloadLoading && !workload.length) { <p class="empty-note">Sin pedidos asignados.</p> }
            <table *ngIf="workload.length">
              <thead><tr><th>Pedido</th><th>Descripción</th><th>Estado</th><th>Entrega</th></tr></thead>
              <tbody>
                <tr *ngFor="let o of workload">
                  <td>#{{ o.id }}</td><td>{{ o.description || '—' }}</td>
                  <td><span class="badge" [class]="'badge st-' + o.status">{{ orderLabel(o.status) }}</span></td>
                  <td>{{ fmtDate(o.deliveryDate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }
  `,
})
export class CarpentersComponent implements OnInit {
  carpenters: any[] = [];
  specialties = SPECIALTIES;
  form: FormGroup;
  showForm = false;
  editing: any = null;
  saving = false;
  workloadFor: any = null;
  workload: any[] = [];
  workloadLoading = false;
  private ref?: QueryRef<{ carpenters: any[] }>;

  constructor(
    private apollo: Apollo, fb: FormBuilder,
    private toast: ToastService, private confirm: ConfirmService,
  ) {
    this.form = fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      specialty: ['GENERAL'],
      yearsExperience: [0],
      hourlyRate: [0],
    });
  }

  ngOnInit(): void {
    this.ref = this.apollo.watchQuery<{ carpenters: any[] }>({ query: CARPENTERS });
    this.ref.valueChanges.subscribe(({ data }) => (this.carpenters = data.carpenters));
  }

  specialtyLabel(s: string): string {
    return SPECIALTIES.find(([v]) => v === s)?.[1] ?? s;
  }
  orderLabel = orderLabel;
  fmtDate = fmtDate;

  actionsOf(c: any): ActionItem[] {
    return [
      { label: 'Editar', run: () => this.openForm(c) },
      { label: 'Ver carga de trabajo', run: () => this.viewWorkload(c) },
      { label: c.active ? 'Desactivar' : 'Activar', run: () => this.toggleActive(c) },
      { label: 'Eliminar', danger: true, run: () => this.delete(c) },
    ];
  }

  openForm(c?: any): void {
    this.editing = c ?? null;
    this.form.reset(c
      ? { name: c.name, email: c.email, phone: c.phone, specialty: c.specialty, yearsExperience: c.yearsExperience, hourlyRate: c.hourlyRate }
      : { specialty: 'GENERAL', yearsExperience: 0, hourlyRate: 0 });
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; this.editing = null; }

  async save(): Promise<void> {
    if (this.form.invalid || this.saving) return;
    const ok = await this.confirm.ask({
      title: this.editing ? 'Guardar cambios' : 'Crear carpintero',
      message: this.editing ? `Se actualizarán los datos de ${this.editing.name}.` : `Se registrará a ${this.form.value.name}.`,
      confirmLabel: 'Guardar',
    });
    if (!ok) return;
    this.saving = true;
    const v = this.form.value;
    const input: any = {
      name: v.name, email: v.email, specialty: v.specialty,
      yearsExperience: Number(v.yearsExperience) || 0,
      hourlyRate: Number(v.hourlyRate) || 0,
    };
    if (v.phone) input.phone = v.phone;
    const obs = this.editing
      ? this.apollo.mutate({ mutation: UPDATE_CARPENTER, variables: { id: this.editing.id, input } })
      : this.apollo.mutate({ mutation: CREATE_CARPENTER, variables: { input } });
    obs.subscribe({
      next: () => { this.toast.ok(this.editing ? 'Carpintero actualizado' : 'Carpintero registrado'); this.closeForm(); this.ref?.refetch(); this.saving = false; },
      error: (e) => { this.toast.fromError(e); this.saving = false; },
    });
  }

  async toggleActive(c: any): Promise<void> {
    const ok = await this.confirm.ask({
      title: c.active ? 'Desactivar carpintero' : 'Activar carpintero',
      message: c.active
          ? `${c.name} dejará de aparecer como disponible para asignaciones.`
          : `${c.name} volverá a estar disponible para asignaciones.`,
      confirmLabel: c.active ? 'Desactivar' : 'Activar',
      danger: c.active,
    });
    if (!ok) return;
    this.apollo.mutate({ mutation: UPDATE_CARPENTER, variables: { id: c.id, input: { active: !c.active } } }).subscribe({
      next: () => { this.toast.ok(c.active ? `${c.name} desactivado` : `${c.name} activado`); this.ref?.refetch(); },
      error: (e) => this.toast.fromError(e),
    });
  }

  viewWorkload(c: any): void {
    this.workloadFor = c;
    this.workload = [];
    this.workloadLoading = true;
    this.apollo.query<{ carpenterWorkload: any[] }>({ query: CARPENTER_WORKLOAD, variables: { carpenterId: c.id }, fetchPolicy: 'network-only' })
      .subscribe({
        next: ({ data }) => { this.workload = data.carpenterWorkload; this.workloadLoading = false; },
        error: (e) => { this.toast.fromError(e); this.workloadLoading = false; },
      });
  }

  async delete(c: any): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Eliminar carpintero',
      message: `Se eliminará a ${c.name}. Si tiene pedidos asignados conviene desactivarlo.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    this.apollo.mutate({ mutation: DELETE_CARPENTER, variables: { id: c.id } }).subscribe({
      next: () => { this.toast.ok('Carpintero eliminado'); this.ref?.refetch(); },
      error: (e) => this.toast.fromError(e, 'No se pudo eliminar'),
    });
  }
}
