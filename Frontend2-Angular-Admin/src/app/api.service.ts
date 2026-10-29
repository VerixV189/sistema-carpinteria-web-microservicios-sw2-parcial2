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

/** Acceso REST al gateway (cotizaciones/pagos no pasan por GraphQL). */
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
}
