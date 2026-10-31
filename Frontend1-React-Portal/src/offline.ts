/**
 * Motor Offline + Caché Local + IA Local en el Navegador (Frontend 1 — React Portal)
 * Sincroniza datos en localStorage cuando hay red y responde con datos locales
 * e IA Local cuando no hay internet o cuando el usuario activa el Modo Offline.
 */

import { PRODUCTS } from './catalog';
import type { MarketplaceProduct } from './api';

const FORCE_OFFLINE_KEY = 'carpinteria_force_offline';
const NET_FAIL_KEY = 'carpinteria_net_failed';
const EVT = 'carpinteria:network-change';

const KEYS = {
  products: 'carpinteria_cache_products',
  quotations: 'carpinteria_cache_quotations',
  invoices: 'carpinteria_cache_invoices',
  orders: 'carpinteria_cache_orders',
  deliveries: 'carpinteria_cache_deliveries',
};

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVT));
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    sessionStorage.removeItem(NET_FAIL_KEY);
    emitChange();
  });
  window.addEventListener('offline', () => {
    emitChange();
  });
}

export function isForceOffline(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(FORCE_OFFLINE_KEY) === '1';
}

export function setForceOffline(val: boolean): void {
  if (typeof localStorage === 'undefined') return;
  if (val) localStorage.setItem(FORCE_OFFLINE_KEY, '1');
  else {
    localStorage.removeItem(FORCE_OFFLINE_KEY);
    sessionStorage.removeItem(NET_FAIL_KEY);
  }
  emitChange();
}

export function markNetworkFailure(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(NET_FAIL_KEY, '1');
    emitChange();
  }
}

export function markNetworkSuccess(): void {
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(NET_FAIL_KEY) === '1') {
    sessionStorage.removeItem(NET_FAIL_KEY);
    emitChange();
  }
}

export function isOffline(): boolean {
  if (typeof window === 'undefined') return false;
  if (isForceOffline()) return true;
  if (!navigator.onLine) return true;
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(NET_FAIL_KEY) === '1') return true;
  return false;
}

export function subscribeOffline(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
    window.removeEventListener('storage', handler);
  };
}

// ─── Lectura / Escritura de Caché con Semilla ───────────────────────────────

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

const SEED_PRODUCTS: MarketplaceProduct[] = PRODUCTS.map((p, idx) => ({
  id: `seed-${p.key.toLowerCase()}`,
  name: p.name,
  category: p.key === 'TABLE' ? 'Mesas' : p.key === 'CHAIR' ? 'Sillas' : p.key === 'WARDROBE' ? 'Roperos' : p.key === 'DOOR' ? 'Puertas' : 'Cocina',
  woodType: idx % 2 === 0 ? 'Roble' : 'Mara',
  dimensions: '180 x 90 x 76 cm',
  price: p.basePrice,
  estimatedDays: 7 + (idx % 4) * 3,
  stock: 3 + (idx % 5),
  description: p.description,
  iconName: 'table_restaurant',
  imageUrl: p.image,
  carpenterEmail: 'carpintero@carpinteria.com',
  carpenterName: 'Maestro Carpintero El Roble',
  createdByRole: 'CARPENTER',
}));

const SEED_QUOTATIONS = [
  {
    id: 'cot-local-001',
    clientId: 'cliente@carpinteria.com',
    status: 'QUOTED',
    aiEstimate: 3450,
    totalAmount: 3450,
    finalAmount: 3300,
    payableAmount: 3300,
    delivery: { type: 'DELIVERY', address: 'Av. Cristo Redentor #450, Santa Cruz' },
    items: [
      {
        description: 'Mesa de comedor 8 personas acabado natural',
        furnitureType: 'TABLE',
        woodType: 'ROBLE',
        quantity: 1,
        unitPrice: 3300,
        subtotal: 3300,
      },
    ],
    createdAt: '2026-10-25T14:30:00Z',
    updatedAt: '2026-10-26T10:15:00Z',
  },
  {
    id: 'cot-local-002',
    clientId: 'cliente@carpinteria.com',
    status: 'APPROVED',
    aiEstimate: 4800,
    totalAmount: 4800,
    finalAmount: 4800,
    payableAmount: 4800,
    delivery: { type: 'PICKUP' },
    items: [
      {
        description: 'Ropero empotrado 3 cuerpos con cajoneras',
        furnitureType: 'WARDROBE',
        woodType: 'MARA',
        quantity: 1,
        unitPrice: 4800,
        subtotal: 4800,
      },
    ],
    createdAt: '2026-10-20T09:00:00Z',
    updatedAt: '2026-10-22T16:40:00Z',
  },
];

const SEED_INVOICES = [
  {
    id: 101,
    invoice_number: 'FAC-2026-0101',
    client_email: 'cliente@carpinteria.com',
    amount: 4800,
    tax: 624,
    total: 5424,
    status: 'ISSUED',
    issued_at: '2026-10-22T17:00:00Z',
    pdf_url: null,
  },
];

export function getCachedProducts(): MarketplaceProduct[] {
  const list = readJson<MarketplaceProduct[]>(KEYS.products, []);
  if (list.length === 0) {
    writeJson(KEYS.products, SEED_PRODUCTS);
    return SEED_PRODUCTS;
  }
  return list;
}

export function setCachedProducts(list: MarketplaceProduct[]): void {
  if (Array.isArray(list) && list.length > 0) {
    writeJson(KEYS.products, list);
  }
}

export function getCachedQuotations(clientId?: string): any[] {
  let list = readJson<any[]>(KEYS.quotations, []);
  if (list.length === 0) {
    writeJson(KEYS.quotations, SEED_QUOTATIONS);
    list = SEED_QUOTATIONS;
  }
  if (!clientId) return list;
  const mine = list.filter((q) => !q.clientId || q.clientId === clientId);
  return mine.length > 0 ? mine : list;
}

export function setCachedQuotations(list: any[]): void {
  if (Array.isArray(list) && list.length > 0) {
    writeJson(KEYS.quotations, list);
  }
}

export function getCachedInvoices(email?: string): any[] {
  const list = readJson<any[]>(KEYS.invoices, SEED_INVOICES);
  if (!email) return list;
  const filtered = list.filter((i) => !i.client_email || i.client_email === email);
  return filtered.length > 0 ? filtered : list;
}

export function setCachedInvoices(list: any[]): void {
  if (Array.isArray(list) && list.length > 0) {
    writeJson(KEYS.invoices, list);
  }
}

// ─── IA Local en el Navegador (Estimación de Precios + Asistente Local) ─────

const WOOD_FACTORS: Record<string, number> = {
  MARA: 1.45,
  ROBLE: 1.35,
  CEDRO: 1.25,
  NOGAL: 1.3,
  CAOBA: 1.4,
  PINO: 0.9,
  MELAMINA: 0.75,
  MDF: 0.7,
};

export function estimatePriceLocally(description: string, woodType = 'ROBLE') {
  const desc = description.toLowerCase();
  let base = 1600;
  let furniture = 'Mueble a medida';
  let days = 8;

  if (desc.includes('ropero') || desc.includes('closet') || desc.includes('armario')) {
    base = 4200; furniture = 'Ropero / Closet'; days = 14;
  } else if (desc.includes('cocina') || desc.includes('alacena')) {
    base = 5200; furniture = 'Mueble de Cocina'; days = 16;
  } else if (desc.includes('mesa') || desc.includes('comedor')) {
    base = 2600; furniture = 'Mesa / Comedor'; days = 10;
  } else if (desc.includes('puerta')) {
    base = 1850; furniture = 'Puerta Principal / Interior'; days = 7;
  } else if (desc.includes('cama') || desc.includes('velador')) {
    base = 2900; furniture = 'Cama / Dormitorio'; days = 11;
  } else if (desc.includes('escritorio') || desc.includes('estante') || desc.includes('repisa')) {
    base = 1750; furniture = 'Escritorio / Estantería'; days = 7;
  } else if (desc.includes('silla') || desc.includes('banco')) {
    base = 680; furniture = 'Silla Artesanal'; days = 5;
  }

  // Detectar dimensiones en metros o cm si el usuario las escribió
  const dimMatch = desc.match(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)/);
  let sizeFactor = 1.0;
  if (dimMatch) {
    const a = parseFloat(dimMatch[1].replace(',', '.'));
    const b = parseFloat(dimMatch[2].replace(',', '.'));
    const area = a > 10 ? (a / 100) * (b / 100) : a * b;
    if (area > 0.3 && area < 12) {
      sizeFactor = Math.max(0.75, Math.min(2.2, 0.7 + area * 0.35));
    }
  }

  const woodFactor = WOOD_FACTORS[woodType.toUpperCase()] ?? 1.15;
  const estimatedPrice = Math.round((base * woodFactor * sizeFactor) / 10) * 10;

  return {
    estimatedPrice,
    currency: 'BOB',
    estimatedDays: days,
    confidence: 0.89,
    source: 'IA Local en Navegador (Offline Engine)',
    explanation: `Cálculo ejecutado por la IA Local del navegador para ${furniture} en madera ${woodType} (factor ${woodFactor}x). Tiempo estimado de fabricación: ${days} días hábiles.`,
  };
}

export function askLocalAgentForClient(query: string, clientEmail?: string): { answer: string; source: string } {
  const q = query.toLowerCase();
  const products = getCachedProducts();
  const quotations = getCachedQuotations(clientEmail);
  const invoices = getCachedInvoices(clientEmail);

  if (q.includes('cotiz') || q.includes('precio') || q.includes('cuánto cuesta') || q.includes('cuanto cuesta')) {
    const quoted = quotations.filter((c) => c.status === 'QUOTED' || c.status === 'APPROVED');
    const estim = estimatePriceLocally(query, 'ROBLE');
    return {
      source: 'local-ai',
      answer:
        `[IA Local Offline] Tienes ${quotations.length} cotización(es) guardadas localmente (${quoted.length} listas o aprobadas).\n` +
        `• Si deseas fabricar un mueble como el que mencionas, la IA Local estima aprox. Bs ${estim.estimatedPrice} (${estim.estimatedDays} días en Roble).\n` +
        `• También tenemos ${products.filter((p) => p.stock > 0).length} muebles con stock inmediato en el Marketplace.`,
    };
  }

  if (q.includes('pedido') || q.includes('estado') || q.includes('va mi') || q.includes('avance')) {
    if (quotations.length === 0) {
      return {
        source: 'local-ai',
        answer: '[IA Local Offline] Aún no tienes pedidos ni cotizaciones registradas en la memoria local de este dispositivo.',
      };
    }
    const resumen = quotations
      .slice(0, 3)
      .map((c) => `• #${String(c.id).slice(0, 8)} (${c.status}): Bs ${c.payableAmount ?? c.totalAmount}`)
      .join('\n');
    return {
      source: 'local-ai',
      answer: `[IA Local Offline] Consulté tu historial sincronizado en el navegador:\n${resumen}`,
    };
  }

  if (q.includes('entrega') || q.includes('llega') || q.includes('envío') || q.includes('envio')) {
    const conEnvio = quotations.filter((c) => c.delivery?.type === 'DELIVERY');
    return {
      source: 'local-ai',
      answer:
        conEnvio.length > 0
          ? `[IA Local Offline] Tienes ${conEnvio.length} solicitud(es) con entrega a domicilio (${conEnvio[0].delivery?.address ?? 'dirección registrada'}). El tiempo promedio de entrega es de 7 a 12 días hábiles.`
          : `[IA Local Offline] Tus solicitudes actuales están configuradas para recojo en taller o aún no tienen fecha de despacho asignada.`,
    };
  }

  if (q.includes('stock') || q.includes('disponible') || q.includes('marketplace') || q.includes('mueble') || q.includes('catálogo') || q.includes('catalogo')) {
    const disp = products.filter((p) => p.stock > 0);
    const top = disp
      .slice(0, 4)
      .map((p) => `• ${p.name} (${p.woodType}) — Bs ${p.price} [Stock: ${p.stock}]`)
      .join('\n');
    return {
      source: 'local-ai',
      answer: `[IA Local Offline] Actualmente hay ${disp.length} muebles disponibles en caché local:\n${top}`,
    };
  }

  if (q.includes('recibo') || q.includes('factura') || q.includes('pago')) {
    return {
      source: 'local-ai',
      answer: `[IA Local Offline] Tienes ${invoices.length} recibo(s) sincronizados localmente en este navegador. Puedes verlos en la pestaña "Mis Recibos".`,
    };
  }

  return {
    source: 'local-ai',
    answer:
      `[IA Local en el Navegador — Modo Offline Activo]\n` +
      `Estoy funcionando sin conexión usando los datos locales sincronizados:\n` +
      `• ${products.length} muebles en el Marketplace\n` +
      `• ${quotations.length} cotizaciones registradas\n` +
      `• ${invoices.length} recibos disponibles\n` +
      `Pregúntame por precios de muebles, stock del Marketplace, tus cotizaciones o entregas.`,
  };
}
