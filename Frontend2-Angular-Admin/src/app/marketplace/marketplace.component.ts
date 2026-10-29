import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ApiService,
  MarketplaceProduct,
  UpsertProductPayload,
} from '../api.service';
import { ToastService } from '../toast.service';
import { ConfirmService } from '../confirm.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="head">
      <div>
        <h2>Marketplace de Muebles Disponibles</h2>
        <p class="sub">
          Publica, edita y controla el stock de los muebles en venta directa (fotos almacenadas en AWS S3).
        </p>
      </div>
      <button class="btn" (click)="openNew()">+ Publicar Mueble</button>
    </div>

    <div class="stats">
      <div class="stat-card">
        <span>Muebles publicados</span>
        <strong>{{ products.length }}</strong>
      </div>
      <div class="stat-card">
        <span>Unidades totales en stock</span>
        <strong>{{ totalStock() }}</strong>
      </div>
      <div class="stat-card">
        <span>Sin stock (Agotados)</span>
        <strong [style.color]="outOfStockCount() > 0 ? '#b91c1c' : '#166534'">
          {{ outOfStockCount() }}
        </strong>
      </div>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Foto</th>
            <th>Mueble</th>
            <th>Categoría / Madera</th>
            <th>Dimensiones</th>
            <th>Precio (Bs)</th>
            <th>Stock</th>
            <th>Publicado por</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (p of products; track p.id) {
            <tr>
              <td>
                <img
                  [src]="p.imageUrl || defaultImg"
                  alt=""
                  class="thumb"
                />
              </td>
              <td>
                <strong>{{ p.name }}</strong>
                <div class="muted">{{ p.description }}</div>
              </td>
              <td>
                <span class="badge">{{ p.category }}</span>
                <div class="muted">Madera {{ p.woodType }}</div>
              </td>
              <td>
                {{ p.dimensions }}
                <div class="muted">~{{ p.estimatedDays }} días</div>
              </td>
              <td><strong>Bs {{ p.price }}</strong></td>
              <td>
                <span
                  class="badge"
                  [class.ok]="p.stock > 0"
                  [class.danger]="p.stock <= 0"
                >
                  {{ p.stock > 0 ? p.stock + ' disp.' : 'Agotado' }}
                </span>
              </td>
              <td>
                <div class="muted">{{ p.carpenterName || p.carpenterEmail || 'Administración' }}</div>
              </td>
              <td>
                <div class="actions">
                  <button class="btn-sm" (click)="openEdit(p)">Editar</button>
                  <button class="btn-sm danger" (click)="remove(p)">Eliminar</button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (modalOpen) {
      <div class="modal-backdrop" (click)="modalOpen = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <h3>{{ editing ? 'Editar Mueble' : 'Publicar Mueble en Marketplace' }}</h3>
            <button class="x" (click)="modalOpen = false">✕</button>
          </div>
          <form (ngSubmit)="save()" class="modal-body">
            <label>
              Nombre del mueble
              <input [(ngModel)]="form.name" name="name" required placeholder="Ej. Mesa Imperial Roble" />
            </label>
            <div class="row2">
              <label>
                Categoría
                <select [(ngModel)]="form.category" name="category">
                  @for (c of categories; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </label>
              <label>
                Madera
                <select [(ngModel)]="form.woodType" name="woodType">
                  @for (w of woods; track w) {
                    <option [value]="w">{{ w }}</option>
                  }
                </select>
              </label>
            </div>
            <div class="row2">
              <label>
                Dimensiones
                <input [(ngModel)]="form.dimensions" name="dimensions" required placeholder="200 x 100 x 76 cm" />
              </label>
              <label>
                Carpintero asignado (email opcional)
                <input [(ngModel)]="form.carpenterEmail" name="carpenterEmail" placeholder="carpintero@carpinteria.com" />
              </label>
            </div>
            <div class="row3">
              <label>
                Precio (Bs)
                <input type="number" [(ngModel)]="form.price" name="price" min="1" required />
              </label>
              <label>
                Stock disponible
                <input type="number" [(ngModel)]="form.stock" name="stock" min="0" required />
              </label>
              <label>
                Días estimados
                <input type="number" [(ngModel)]="form.estimatedDays" name="estimatedDays" min="1" required />
              </label>
            </div>
            <label>
              Descripción
              <textarea [(ngModel)]="form.description" name="description" rows="3" required></textarea>
            </label>
            <label>
              Subir foto al bucket AWS S3
              <input type="file" accept="image/*" (change)="onFileSelected($event)" />
            </label>
            <div class="modal-foot">
              <button type="button" class="btn-sm" (click)="modalOpen = false">Cancelar</button>
              <button type="submit" class="btn" [disabled]="saving">
                {{ saving ? 'Subiendo a S3 y guardando…' : 'Guardar Mueble' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 12px; flex-wrap: wrap; }
    h2 { margin: 0; color: #3B2F2F; }
    .sub { margin: 4px 0 0; color: #8a7f75; font-size: 13.5px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 18px; }
    .stat-card { background: #fff; padding: 14px 18px; border-radius: 10px; border: 1px solid #ede4d8; display: flex; flex-direction: column; gap: 4px; }
    .stat-card span { font-size: 12px; color: #8a7f75; }
    .stat-card strong { font-size: 22px; color: #8B5A2B; }
    .card { background: #fff; border-radius: 12px; border: 1px solid #ede4d8; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #f2ebe1; vertical-align: middle; }
    th { background: #faf7f2; color: #5c534a; font-weight: 600; }
    .thumb { width: 58px; height: 42px; object-fit: cover; border-radius: 6px; background: #ede4d8; }
    .muted { font-size: 12px; color: #8a7f75; max-width: 280px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #f0e7dc; color: #8B5A2B; }
    .badge.ok { background: #dcfce7; color: #166534; }
    .badge.danger { background: #fee2e2; color: #991b1b; }
    .actions { display: flex; gap: 6px; }
    .btn { background: #8B5A2B; color: #fff; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-sm { background: #faf7f2; border: 1px solid #d4a574; color: #3B2F2F; padding: 6px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; }
    .btn-sm.danger { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal { background: #fff; border-radius: 14px; width: min(540px, 96vw); max-height: 92vh; overflow-y: auto; padding: 20px; }
    .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .modal-head h3 { margin: 0; color: #3B2F2F; }
    .x { border: none; background: #ede4d8; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; }
    .modal-body { display: flex; flex-direction: column; gap: 12px; }
    .modal-body label { display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; font-weight: 600; color: #3B2F2F; }
    .modal-body input, .modal-body select, .modal-body textarea { padding: 9px 11px; border: 1px solid #ddd4c8; border-radius: 8px; font-size: 13.5px; font-family: inherit; }
    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .modal-foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  `],
})
export class MarketplaceComponent implements OnInit {
  products: MarketplaceProduct[] = [];
  categories = ['Mesas', 'Sillas', 'Roperos', 'Puertas', 'Cocina'];
  woods = ['Roble', 'Mara', 'Cedro', 'Pino', 'Melamina'];
  defaultImg = 'https://res.cloudinary.com/dwerzrgya/image/upload/c_fill,w_800,h_500,q_auto,f_auto/carpinteria/catalog/catalog-table.jpg';

  modalOpen = false;
  saving = false;
  editing: MarketplaceProduct | null = null;
  selectedFile: File | null = null;

  form: UpsertProductPayload = {
    name: '',
    category: 'Mesas',
    woodType: 'Roble',
    dimensions: '180 x 90 x 76 cm',
    price: 1800,
    estimatedDays: 10,
    stock: 3,
    description: '',
    carpenterEmail: 'carpintero@carpinteria.com',
  };

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    try {
      this.products = await this.api.products();
    } catch {
      this.toast.err('No se pudo cargar el Marketplace');
    }
  }

  totalStock(): number {
    return this.products.reduce((acc, p) => acc + (p.stock || 0), 0);
  }

  outOfStockCount(): number {
    return this.products.filter((p) => p.stock <= 0).length;
  }

  openNew() {
    this.editing = null;
    this.selectedFile = null;
    this.form = {
      name: '',
      category: 'Mesas',
      woodType: 'Roble',
      dimensions: '180 x 90 x 76 cm',
      price: 1800,
      estimatedDays: 10,
      stock: 3,
      description: '',
      carpenterEmail: 'carpintero@carpinteria.com',
    };
    this.modalOpen = true;
  }

  openEdit(p: MarketplaceProduct) {
    this.editing = p;
    this.selectedFile = null;
    this.form = {
      name: p.name,
      category: p.category,
      woodType: p.woodType,
      dimensions: p.dimensions,
      price: p.price,
      estimatedDays: p.estimatedDays,
      stock: p.stock,
      description: p.description,
      imageUrl: p.imageUrl,
      carpenterEmail: p.carpenterEmail ?? '',
      carpenterName: p.carpenterName,
    };
    this.modalOpen = true;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  async save() {
    this.saving = true;
    try {
      let imageUrl = this.form.imageUrl;
      if (this.selectedFile) {
        imageUrl = await this.api.uploadImageToS3(this.selectedFile, 'marketplace');
      }
      const payload: UpsertProductPayload = {
        ...this.form,
        price: Number(this.form.price),
        stock: Number(this.form.stock),
        estimatedDays: Number(this.form.estimatedDays ?? 10),
        imageUrl,
      };
      if (this.editing) {
        await this.api.updateProduct(this.editing.id, payload);
        this.toast.ok('Mueble actualizado en el Marketplace');
      } else {
        await this.api.createProduct(payload);
        this.toast.ok('Mueble publicado en el Marketplace');
      }
      this.modalOpen = false;
      await this.load();
    } catch (e) {
      this.toast.err((e as Error).message || 'Error al guardar');
    } finally {
      this.saving = false;
    }
  }

  async remove(p: MarketplaceProduct) {
    const ok = await this.confirm.ask({
      title: 'Eliminar mueble del Marketplace',
      message: `¿Seguro que deseas eliminar "${p.name}"?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await this.api.deleteProduct(p.id);
      this.toast.ok('Mueble eliminado');
      await this.load();
    } catch (e) {
      this.toast.err((e as Error).message || 'No se pudo eliminar');
    }
  }
}
