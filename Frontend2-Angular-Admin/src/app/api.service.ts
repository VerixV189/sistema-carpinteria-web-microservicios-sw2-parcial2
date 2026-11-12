import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { OfflineAiService } from './offline-ai.service';

export interface QuotationItem {
  description: string;
  furnitureType: string;
  woodType: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  dimensions?: { lengthM: number; widthM: number; heightM: number };
}

export interface Quotation {
  id: string;
  clientId: string;
  status: 'DRAFT' | 'QUOTED' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
  photoUrl?: string;
  aiEstimate?: number;
  totalAmount: number;
  finalAmount?: number | null;
  payableAmount?: number;
  delivery?: { type: 'PICKUP' | 'DELIVERY'; address?: string; lat?: number; lng?: number } | null;
  clientMessage?: string | null;
  counterAmount?: number | null;
  items: QuotationItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  category: string;
  woodType: string;
  dimensions: string;
  price: number;
  estimatedDays: number;
  stock: number;
  description: string;
  iconName: string;
  imageUrl?: string;
  carpenterEmail?: string;
  carpenterName?: string;
  createdByRole?: 'ADMIN' | 'CARPENTER';
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertProductPayload {
  name: string;
  category: string;
  woodType: string;
  dimensions: string;
  price: number;
  estimatedDays?: number;
  stock: number;
  description: string;
  imageUrl?: string;
  carpenterEmail?: string;
  carpenterName?: string;
}

export interface ClientCluster {
  clusterId: number;
  label: string;
  size: number;
  clientIds: (number | string)[];
  centroid?: {
    total_orders?: number;
    total_spent?: number;
    recency_days?: number;
  };
}

export interface ClusterClientsResponse {
  algorithm: string;
  clusters: ClientCluster[];
}

/** Acceso REST al gateway con soporte Offline-First + IA Local. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = (() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const rootDomain = host.replace(/^(www|admin|taller|api)\./, '');
    return isHttps ? `https://api.${rootDomain}` : `http://${host}:3000`;
  })();

  constructor(private auth: AuthService, private offlineAi: OfflineAiService) {}

  private async req<T>(path: string, init?: RequestInit): Promise<T> {
    if (this.offlineAi.offline()) {
      throw new Error('OFFLINE_MODE');
    }
    try {
      const r = await fetch(this.base + path, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.auth.token() ?? ''}`,
          ...(init?.headers ?? {}),
        },
      });
      this.offlineAi.markNetworkSuccess();
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `Error ${r.status}`);
      }
      return r.json() as Promise<T>;
    } catch (e) {
      if (e instanceof TypeError) {
        this.offlineAi.markNetworkFailure();
      }
      throw e;
    }
  }

  async quotations(): Promise<Quotation[]> {
    try {
      const list = await this.req<Quotation[]>('/api/quotations');
      this.offlineAi.setQuotations(list);
      return list;
    } catch {
      return this.offlineAi.getQuotations();
    }
  }

  /** CU1 — Segmentación inteligente de clientes (X-Means / K-Means en Python IA o IA Local Offline). */
  async clusterClients(clients?: any[], orders?: any[]): Promise<ClusterClientsResponse> {
    try {
      const res = await this.req<ClusterClientsResponse>('/api/ai/cluster-clients', {
        method: 'POST',
        body: JSON.stringify({ clients: clients ?? [], orders: orders ?? [] }),
      });
      const totalClustered = (res?.clusters ?? []).reduce((acc, c) => acc + (c.size ?? c.clientIds?.length ?? 0), 0);
      if (!res?.clusters?.length || totalClustered === 0) {
        return this.offlineAi.clusterClientsLocally(clients, orders);
      }
      return res;
    } catch {
      return this.offlineAi.clusterClientsLocally(clients, orders);
    }
  }

  async approveQuotation(id: string, orderId?: number): Promise<Quotation> {
    try {
      return await this.req<Quotation>(`/api/quotations/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify(orderId ? { orderId } : {}),
      });
    } catch {
      const list = this.offlineAi.getQuotations().map((q) =>
        q.id === id ? { ...q, status: 'APPROVED' as const, updatedAt: new Date().toISOString() } : q,
      );
      this.offlineAi.setQuotations(list);
      return list.find((q) => q.id === id)!;
    }
  }

  async rejectQuotation(id: string): Promise<Quotation> {
    try {
      return await this.req<Quotation>(`/api/quotations/${id}/reject`, {
        method: 'POST',
        body: '{}',
      });
    } catch {
      const list = this.offlineAi.getQuotations().map((q) =>
        q.id === id ? { ...q, status: 'REJECTED' as const, updatedAt: new Date().toISOString() } : q,
      );
      this.offlineAi.setQuotations(list);
      return list.find((q) => q.id === id)!;
    }
  }

  /** El taller fija el precio formal y se lo envía al cliente → QUOTED. */
  async sendQuotation(id: string, finalAmount?: number): Promise<Quotation> {
    try {
      return await this.req<Quotation>(`/api/quotations/${id}/send`, {
        method: 'POST',
        body: JSON.stringify(finalAmount != null ? { finalAmount } : {}),
      });
    } catch {
      const list = this.offlineAi.getQuotations().map((q) =>
        q.id === id
          ? {
              ...q,
              status: 'QUOTED' as const,
              finalAmount: finalAmount ?? q.totalAmount,
              payableAmount: finalAmount ?? q.totalAmount,
              updatedAt: new Date().toISOString(),
            }
          : q,
      );
      this.offlineAi.setQuotations(list);
      return list.find((q) => q.id === id)!;
    }
  }

  // — Marketplace CRUD + AWS S3 + Caché Offline —

  async products(): Promise<MarketplaceProduct[]> {
    try {
      const list = await this.req<MarketplaceProduct[]>('/api/products');
      this.offlineAi.setProducts(list);
      return list;
    } catch {
      return this.offlineAi.getProducts();
    }
  }

  async createProduct(payload: UpsertProductPayload): Promise<MarketplaceProduct> {
    try {
      const created = await this.req<MarketplaceProduct>('/api/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      this.offlineAi.setProducts([created, ...this.offlineAi.getProducts()]);
      return created;
    } catch {
      const created: MarketplaceProduct = {
        id: `local-${Date.now()}`,
        name: payload.name,
        category: payload.category,
        woodType: payload.woodType,
        dimensions: payload.dimensions,
        price: payload.price,
        estimatedDays: payload.estimatedDays ?? 10,
        stock: payload.stock,
        description: payload.description,
        iconName: 'table_restaurant',
        imageUrl: payload.imageUrl,
        carpenterEmail: payload.carpenterEmail,
        carpenterName: payload.carpenterName,
        createdByRole: 'ADMIN',
      };
      this.offlineAi.setProducts([created, ...this.offlineAi.getProducts()]);
      return created;
    }
  }

  async updateProduct(id: string, payload: UpsertProductPayload): Promise<MarketplaceProduct> {
    try {
      return await this.req<MarketplaceProduct>(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch {
      const list = this.offlineAi.getProducts().map((p) => (p.id === id ? { ...p, ...payload } : p));
      this.offlineAi.setProducts(list);
      return list.find((p) => p.id === id)!;
    }
  }

  async deleteProduct(id: string): Promise<{ deleted: boolean; id: string }> {
    try {
      return await this.req<{ deleted: boolean; id: string }>(`/api/products/${id}`, {
        method: 'DELETE',
      });
    } catch {
      this.offlineAi.setProducts(this.offlineAi.getProducts().filter((p) => p.id !== id));
      return { deleted: true, id };
    }
  }

  async upsertUserAccount(payload: {
    email: string;
    name: string;
    password?: string;
    role: 'CARPENTER' | 'CLIENT' | 'ADMIN';
  }): Promise<void> {
    try {
      await this.req('/api/auth/register-user', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // Si está offline, el gateway aprovisionará la cuenta al primer login
    }
  }

  async uploadImageToS3(file: File, folder = 'marketplace'): Promise<string> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
    try {
      const base64 = dataUrl.split(',')[1];
      const res = await this.req<{ url: string }>('/api/uploads/s3', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          base64,
          folder,
        }),
      });
      return res.url;
    } catch {
      // En modo offline devolvemos el DataURL local para que la imagen se vea sin internet
      return dataUrl;
    }
  }
}
