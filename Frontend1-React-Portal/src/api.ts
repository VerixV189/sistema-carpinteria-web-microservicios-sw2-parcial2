// Cliente REST → gateway (quotation-payment-service + marketplace + billing-service)
import { getSession } from './auth';

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
  const r = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  if (!r.ok) {
    const errBody = await r.json().catch(() => null);
    throw new Error(errBody?.message ?? (await r.text()) ?? `Error ${r.status}`);
  }
  return r.json();
}

async function put<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
  if (!r.ok) {
    const errBody = await r.json().catch(() => null);
    throw new Error(errBody?.message ?? `Error ${r.status}`);
  }
  return r.json();
}

async function del<T>(url: string): Promise<T> {
  const r = await fetch(url, { method: 'DELETE', headers: headers() });
  if (!r.ok) {
    const errBody = await r.json().catch(() => null);
    throw new Error(errBody?.message ?? `Error ${r.status}`);
  }
  return r.json();
}

async function get<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: headers() });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
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

  // — Marketplace (Flujo 2: Muebles disponibles + Compra directa) —
  products: (params?: { category?: string; search?: string; availableOnly?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== 'Todos') qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.availableOnly) qs.set('availableOnly', 'true');
    const query = qs.toString();
    return get<MarketplaceProduct[]>(`${GATEWAY}/products${query ? `?${query}` : ''}`);
  },
  createProduct: (input: UpsertProductInput) =>
    post<MarketplaceProduct>(`${GATEWAY}/products`, input),
  updateProduct: (id: string, input: UpsertProductInput) =>
    put<MarketplaceProduct>(`${GATEWAY}/products/${id}`, input),
  deleteProduct: (id: string) =>
    del<{ deleted: boolean; id: string }>(`${GATEWAY}/products/${id}`),
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

  // — Cotizaciones a medida (Flujo 1) —
  createQuotation: (input: {
    clientId: string;
    photoUrl?: string;
    requestEstimate?: boolean;
    delivery?: { type: 'PICKUP' | 'DELIVERY'; address?: string; lat?: number; lng?: number };
    items: Array<{
      description: string; furnitureType: string; woodType: string;
      quantity: number; unitPrice: number;
    }>;
  }) => post<any>(`${GATEWAY}/quotations`, input),
  getQuotation: (id: string) => get<any>(`${GATEWAY}/quotations/${id}`),
  myQuotations: (clientId: string) =>
    get<any[]>(`${GATEWAY}/quotations?clientId=${encodeURIComponent(clientId)}`),
  respondQuotation: (id: string, input: {
    action: 'accept' | 'reject' | 'counter';
    message?: string; counterAmount?: number;
  }) => post<any>(`${GATEWAY}/quotations/${id}/respond`, input),
  pay: (input: {
    quotationId: string; clientId: string; amount: number;
    cardNumber: string; cardHolder: string;
    expiryMonth: number; expiryYear: number; cvv: string;
  }) => post<any>(`${GATEWAY}/payments`, input),
  estimate: (description: string, woodType?: string, imageBase64?: string) =>
    post<any>(`${AI}/estimate`, { description, woodType, imageBase64 }),
  agent: (query: string, sessionId: string) =>
    post<any>(`${AI}/agent`, { query, session_id: sessionId }),
  uploadPhoto: s3Upload,
  photoBase64: fileToBase64,
  invoices: (clientEmail: string) =>
    get<any>(`${GATEWAY}/invoices?client_email=${encodeURIComponent(clientEmail)}`),
};
