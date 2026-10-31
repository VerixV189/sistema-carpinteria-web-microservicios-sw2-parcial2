// Cliente REST → gateway (quotation-payment-service + marketplace + billing-service)
// Con soporte Offline-First + Caché Local + IA Local en el Navegador
import { getSession } from './auth';
import {
  askLocalAgentForClient,
  estimatePriceLocally,
  getCachedInvoices,
  getCachedProducts,
  getCachedQuotations,
  isOffline,
  markNetworkFailure,
  markNetworkSuccess,
  setCachedInvoices,
  setCachedProducts,
  setCachedQuotations,
} from './offline';

const HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const IS_HTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:';
const ROOT_DOMAIN = HOST.replace(/^(www|admin|taller|api)\./, '');
const DEFAULT_BASE = IS_HTTPS ? `https://api.${ROOT_DOMAIN}` : `http://${HOST}:3000`;
const BASE = import.meta.env.VITE_GATEWAY_URL || DEFAULT_BASE;
const GATEWAY = `${BASE}/api`;
const AUTH = BASE;
const AI = `${BASE}/api/ai`;

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

export interface UpsertProductInput {
  name: string;
  category: string;
  woodType: string;
  dimensions: string;
  price: number;
  estimatedDays?: number;
  stock: number;
  description: string;
  iconName?: string;
  imageUrl?: string;
  carpenterEmail?: string;
  carpenterName?: string;
}

function headers() {
  const token = getSession()?.token;
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function post<T>(url: string, body: unknown): Promise<T> {
  if (isOffline()) {
    throw new Error('OFFLINE_MODE');
  }
  try {
    const r = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
    markNetworkSuccess();
    if (!r.ok) {
      const errBody = await r.json().catch(() => null);
      throw new Error(errBody?.message ?? (await r.text()) ?? `Error ${r.status}`);
    }
    return r.json();
  } catch (e) {
    if (e instanceof TypeError) markNetworkFailure();
    throw e;
  }
}

async function put<T>(url: string, body: unknown): Promise<T> {
  if (isOffline()) {
    throw new Error('OFFLINE_MODE');
  }
  try {
    const r = await fetch(url, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
    markNetworkSuccess();
    if (!r.ok) {
      const errBody = await r.json().catch(() => null);
      throw new Error(errBody?.message ?? `Error ${r.status}`);
    }
    return r.json();
  } catch (e) {
    if (e instanceof TypeError) markNetworkFailure();
    throw e;
  }
}

async function del<T>(url: string): Promise<T> {
  if (isOffline()) {
    throw new Error('OFFLINE_MODE');
  }
  try {
    const r = await fetch(url, { method: 'DELETE', headers: headers() });
    markNetworkSuccess();
    if (!r.ok) {
      const errBody = await r.json().catch(() => null);
      throw new Error(errBody?.message ?? `Error ${r.status}`);
    }
    return r.json();
  } catch (e) {
    if (e instanceof TypeError) markNetworkFailure();
    throw e;
  }
}

async function get<T>(url: string): Promise<T> {
  if (isOffline()) {
    throw new Error('OFFLINE_MODE');
  }
  try {
    const r = await fetch(url, { headers: headers() });
    markNetworkSuccess();
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  } catch (e) {
    if (e instanceof TypeError) markNetworkFailure();
    throw e;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve((fr.result as string).split(',')[1]);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

/** Sube una imagen al bucket AWS S3 a través del Gateway (/api/uploads/s3). */
async function s3Upload(file: File, folder = 'quotations'): Promise<string | null> {
  try {
    const base64 = await fileToBase64(file);
    const res = await post<{ url: string; s3Url?: string | null }>(`${GATEWAY}/uploads/s3`, {
      fileName: file.name,
      mimeType: file.type || 'image/jpeg',
      base64,
      folder,
    });
    return res.url;
  } catch {
    return null;
  }
}

export const api = {
  login: (email: string, password: string) =>
    post<{ accessToken: string }>(`${AUTH}/auth/login`, { email, password }),
  register: (input: { name: string; email: string; password: string; phone?: string; address?: string }) =>
    post<{ accessToken: string }>(`${AUTH}/auth/register`, input),

  // — Marketplace (Flujo 2: Muebles disponibles + Compra directa + Caché Offline) —
  products: async (params?: { category?: string; search?: string; availableOnly?: boolean }) => {
    const filterLocal = (list: MarketplaceProduct[]) => {
      return list.filter((p) => {
        if (params?.category && params.category !== 'Todos' && p.category !== params.category) return false;
        if (params?.availableOnly && p.stock <= 0) return false;
        if (params?.search) {
          const s = params.search.toLowerCase();
          if (!p.name.toLowerCase().includes(s) && !p.woodType.toLowerCase().includes(s) && !p.description.toLowerCase().includes(s)) {
            return false;
          }
        }
        return true;
      });
    };
    try {
      const qs = new URLSearchParams();
      if (params?.category && params.category !== 'Todos') qs.set('category', params.category);
      if (params?.search) qs.set('search', params.search);
      if (params?.availableOnly) qs.set('availableOnly', 'true');
      const query = qs.toString();
      const remote = await get<MarketplaceProduct[]>(`${GATEWAY}/products${query ? `?${query}` : ''}`);
      if (!params?.category && !params?.search) setCachedProducts(remote);
      return remote;
    } catch {
      return filterLocal(getCachedProducts());
    }
  },
  createProduct: async (input: UpsertProductInput) => {
    try {
      return await post<MarketplaceProduct>(`${GATEWAY}/products`, input);
    } catch {
      const created: MarketplaceProduct = {
        id: `local-prod-${Date.now()}`,
        name: input.name,
        category: input.category,
        woodType: input.woodType,
        dimensions: input.dimensions,
        price: input.price,
        estimatedDays: input.estimatedDays ?? 10,
        stock: input.stock,
        description: input.description,
        iconName: input.iconName ?? 'table_restaurant',
        imageUrl: input.imageUrl,
        carpenterEmail: input.carpenterEmail,
        carpenterName: input.carpenterName,
        createdAt: new Date().toISOString(),
      };
      const list = [created, ...getCachedProducts()];
      setCachedProducts(list);
      return created;
    }
  },
  updateProduct: async (id: string, input: UpsertProductInput) => {
    try {
      return await put<MarketplaceProduct>(`${GATEWAY}/products/${id}`, input);
    } catch {
      const list = getCachedProducts().map((p) => (p.id === id ? { ...p, ...input } : p));
      setCachedProducts(list);
      return list.find((p) => p.id === id)!;
    }
  },
  deleteProduct: async (id: string) => {
    try {
      return await del<{ deleted: boolean; id: string }>(`${GATEWAY}/products/${id}`);
    } catch {
      setCachedProducts(getCachedProducts().filter((p) => p.id !== id));
      return { deleted: true, id };
    }
  },
  checkoutMarketplace: (input: {
    items: Array<{ productId: string; quantity: number }>;
    deliveryType: 'PICKUP' | 'DELIVERY';
    deliveryAddress?: string;
    deliveryLat?: number;
    deliveryLng?: number;
    notes?: string;
    cardNumber: string;
    cardHolder: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
  }) => post<any>(`${GATEWAY}/products/checkout`, input),

  // — Cotizaciones a medida (Flujo 1 + Caché Offline) —
  createQuotation: async (input: {
    clientId: string;
    photoUrl?: string;
    requestEstimate?: boolean;
    delivery?: { type: 'PICKUP' | 'DELIVERY'; address?: string; lat?: number; lng?: number };
    items: Array<{
      description: string; furnitureType: string; woodType: string;
      quantity: number; unitPrice: number;
    }>;
  }) => {
    try {
      const created = await post<any>(`${GATEWAY}/quotations`, input);
      const list = [created, ...getCachedQuotations()];
      setCachedQuotations(list);
      return created;
    } catch {
      const totalAmount = input.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
      const localQuote = {
        id: `cot-offline-${Date.now().toString().slice(-5)}`,
        clientId: input.clientId,
        status: 'DRAFT',
        photoUrl: input.photoUrl,
        aiEstimate: totalAmount,
        totalAmount,
        payableAmount: totalAmount,
        delivery: input.delivery ?? { type: 'PICKUP' },
        items: input.items.map((it) => ({ ...it, subtotal: it.quantity * it.unitPrice })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const all = [localQuote, ...getCachedQuotations()];
      setCachedQuotations(all);
      return localQuote;
    }
  },
  getQuotation: async (id: string) => {
    try {
      return await get<any>(`${GATEWAY}/quotations/${id}`);
    } catch {
      return getCachedQuotations().find((q) => q.id === id) ?? null;
    }
  },
  myQuotations: async (clientId: string) => {
    try {
      const list = await get<any[]>(`${GATEWAY}/quotations?clientId=${encodeURIComponent(clientId)}`);
      setCachedQuotations(list);
      return list;
    } catch {
      return getCachedQuotations(clientId);
    }
  },
  respondQuotation: async (id: string, input: {
    action: 'accept' | 'reject' | 'counter';
    message?: string; counterAmount?: number;
  }) => {
    try {
      return await post<any>(`${GATEWAY}/quotations/${id}/respond`, input);
    } catch {
      const statusMap = { accept: 'APPROVED', reject: 'REJECTED', counter: 'QUOTED' } as const;
      const list = getCachedQuotations().map((q) =>
        q.id === id
          ? {
              ...q,
              status: statusMap[input.action],
              clientMessage: input.message,
              counterAmount: input.counterAmount,
              updatedAt: new Date().toISOString(),
            }
          : q,
      );
      setCachedQuotations(list);
      return list.find((q) => q.id === id);
    }
  },
  pay: (input: {
    quotationId: string; clientId: string; amount: number;
    cardNumber: string; cardHolder: string;
    expiryMonth: number; expiryYear: number; cvv: string;
  }) => post<any>(`${GATEWAY}/payments`, input),
  estimate: async (description: string, woodType?: string, imageBase64?: string) => {
    try {
      return await post<any>(`${AI}/estimate`, { description, woodType, imageBase64 });
    } catch {
      return estimatePriceLocally(description, woodType);
    }
  },
  agent: async (query: string, sessionId: string) => {
    try {
      return await post<any>(`${AI}/agent`, { query, session_id: sessionId });
    } catch {
      return askLocalAgentForClient(query, getSession()?.email);
    }
  },
  uploadPhoto: s3Upload,
  photoBase64: fileToBase64,
  invoices: async (clientEmail: string) => {
    try {
      const res = await get<any>(`${GATEWAY}/invoices?client_email=${encodeURIComponent(clientEmail)}`);
      const arr = Array.isArray(res) ? res : (res?.data ?? []);
      if (arr.length > 0) setCachedInvoices(arr);
      return res;
    } catch {
      return { data: getCachedInvoices(clientEmail), offline: true };
    }
  },
};
