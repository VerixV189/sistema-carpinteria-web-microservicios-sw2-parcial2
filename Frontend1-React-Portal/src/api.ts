// Cliente REST → gateway (quotation-payment-service + billing-service)
import { getSession } from './auth';

const BASE = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:3000';
const GATEWAY = `${BASE}/api`;
const AUTH = BASE;
const AI = `${BASE}/api/ai`;

function headers() {
  const token = getSession()?.token;
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
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

/** Sube una imagen a Cloudinary con firma generada por el gateway (el secret nunca llega al navegador). */
async function cloudinaryUpload(file: File): Promise<string | null> {
  try {
    const sig = await get<{ cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string }>(
      `${GATEWAY}/uploads/cloudinary-signature`,
    );
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', sig.apiKey);
    fd.append('timestamp', String(sig.timestamp));
    fd.append('signature', sig.signature);
    fd.append('folder', sig.folder);
    const r = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: fd });
    if (!r.ok) return null;
    return (await r.json()).secure_url as string;
  } catch {
    return null; // sin Cloudinary configurado → la cotización sigue sin foto
  }
}

export const api = {
  login: (email: string, password: string) =>
    post<{ accessToken: string }>(`${AUTH}/auth/login`, { email, password }),
  register: (input: { name: string; email: string; password: string; phone?: string; address?: string }) =>
    post<{ accessToken: string }>(`${AUTH}/auth/register`, input),
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
  uploadPhoto: cloudinaryUpload,
  photoBase64: fileToBase64,
  invoices: (clientEmail: string) =>
    get<any>(`${GATEWAY}/invoices?client_email=${encodeURIComponent(clientEmail)}`),
};
