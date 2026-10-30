import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

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

/** Acceso REST al gateway (cotizaciones, pagos, marketplace y subida S3). */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = (() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const rootDomain = host.replace(/^(www|admin|taller|api)\./, '');
    return isHttps ? `https://api.${rootDomain}` : `http://${host}:3000`;
  })();

  constructor(private auth: AuthService) {}

  private async req<T>(path: string, init?: RequestInit): Promise<T> {
    const r = await fetch(this.base + path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.auth.token() ?? ''}`,
        ...(init?.headers ?? {}),
      },
    });
    if (!r.ok) {
      const body = await r.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message ?? `Error ${r.status}`);
    }
    return r.json() as Promise<T>;
  }

  quotations(): Promise<Quotation[]> {
    return this.req<Quotation[]>('/api/quotations');
  }

  /** CU1 — Segmentación inteligente de clientes (X-Means / K-Means en Python IA). */
  clusterClients(): Promise<ClusterClientsResponse> {
    return this.req<ClusterClientsResponse>('/api/ai/cluster-clients', {
      method: 'POST',
      body: '{}',
    });
  }

  approveQuotation(id: string, orderId?: number): Promise<Quotation> {
    return this.req<Quotation>(`/api/quotations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(orderId ? { orderId } : {}),
    });
  }

  rejectQuotation(id: string): Promise<Quotation> {
    return this.req<Quotation>(`/api/quotations/${id}/reject`, {
      method: 'POST',
      body: '{}',
    });
  }

  /** El taller fija el precio formal y se lo envía al cliente → QUOTED. */
  sendQuotation(id: string, finalAmount?: number): Promise<Quotation> {
    return this.req<Quotation>(`/api/quotations/${id}/send`, {
      method: 'POST',
      body: JSON.stringify(finalAmount != null ? { finalAmount } : {}),
    });
  }

  // — Marketplace CRUD + AWS S3 —

  products(): Promise<MarketplaceProduct[]> {
    return this.req<MarketplaceProduct[]>('/api/products');
  }

  createProduct(payload: UpsertProductPayload): Promise<MarketplaceProduct> {
    return this.req<MarketplaceProduct>('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  updateProduct(id: string, payload: UpsertProductPayload): Promise<MarketplaceProduct> {
    return this.req<MarketplaceProduct>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  deleteProduct(id: string): Promise<{ deleted: boolean; id: string }> {
    return this.req<{ deleted: boolean; id: string }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadImageToS3(file: File, folder = 'marketplace'): Promise<string> {
    const base64 = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve((fr.result as string).split(',')[1]);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
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
  }
}
