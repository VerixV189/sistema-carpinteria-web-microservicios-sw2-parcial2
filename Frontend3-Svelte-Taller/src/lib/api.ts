const HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const IS_HTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:';
const ROOT_DOMAIN = HOST.replace(/^(www|admin|taller|api)\./, '');
const BASE = IS_HTTPS ? `https://api.${ROOT_DOMAIN}` : `http://${HOST}:3000`;
const GATEWAY = `${BASE}/api`;
const AI = `${BASE}/api/ai`;
const GRAPHQL = `${BASE}/graphql`;

const FORCE_OFFLINE_KEY = 'carpinteria_force_offline';
const NET_FAIL_KEY = 'carpinteria_net_failed';
const EVT = 'carpinteria:network-change';

const KEYS = {
  carpenters: 'carpinteria_taller_cache_carpenters',
  orders: 'carpinteria_taller_cache_orders',
  deliveries: 'carpinteria_taller_cache_deliveries',
  products: 'carpinteria_cache_products',
};

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

// ─── Datos Semilla del Taller para Modo Offline ─────────────────────────────

const SEED_CARPENTER = {
  id: '1',
  name: 'Roberto Quispe (Maestro Ebanista)',
  email: 'carpintero@carpinteria.com',
};

const SEED_WORKSHOP_ORDERS = [
  {
    id: '101',
    description: 'Mesa de Comedor Imperial 8 personas en Roble',
    status: 'IN_PRODUCTION',
    deliveryDate: '2026-11-05',
    client: { name: 'Carlos Mendoza' },
    items: [{ description: 'Mesa Comedor 240x110cm', quantity: 1, furnitureType: 'TABLE', woodType: 'ROBLE' }],
    steps: [
      { id: '1001', name: 'Corte y cepillado de madera', status: 'COMPLETED', sequence: 1 },
      { id: '1002', name: 'Ensamblado y espigado', status: 'IN_PROGRESS', sequence: 2 },
      { id: '1003', name: 'Lijado y barnizado poliuretano', status: 'PENDING', sequence: 3 },
    ],
    delivery: {
      scheduledDate: '2026-11-05',
      timeSlot: 'MORNING',
      status: 'SCHEDULED',
      address: 'Av. Banzer 4to Anillo, Santa Cruz',
      deliveryType: 'DELIVERY',
      latitude: -17.754,
      longitude: -63.178,
    },
    deliveryType: 'DELIVERY',
    deliveryAddress: 'Av. Banzer 4to Anillo, Santa Cruz',
    deliveryLat: -17.754,
    deliveryLng: -63.178,
  },
  {
    id: '102',
    description: 'Ropero Empotrado 3 Cuerpos en Mara',
    status: 'PENDING',
    deliveryDate: '2026-11-10',
    client: { name: 'María Fernanda Suárez' },
    items: [{ description: 'Ropero 3 cuerpos con espejos', quantity: 1, furnitureType: 'WARDROBE', woodType: 'MARA' }],
    steps: [
      { id: '1004', name: 'Corte de paneles de Mara', status: 'PENDING', sequence: 1 },
      { id: '1005', name: 'Armado de cajoneras y rieles', status: 'PENDING', sequence: 2 },
    ],
    delivery: {
      scheduledDate: '2026-11-10',
      timeSlot: 'AFTERNOON',
      status: 'SCHEDULED',
      address: 'Equipetrol Calle 7 #120',
      deliveryType: 'DELIVERY',
      latitude: -17.762,
      longitude: -63.195,
    },
    deliveryType: 'DELIVERY',
    deliveryAddress: 'Equipetrol Calle 7 #120',
    deliveryLat: -17.762,
    deliveryLng: -63.195,
  },
];

const SEED_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod-1',
    name: 'Mesa de Comedor Imperial 8 Personas',
    category: 'Mesas',
    woodType: 'Roble',
    dimensions: '240 x 110 x 76 cm',
    price: 3600,
    estimatedDays: 10,
    stock: 3,
    description: 'Mesa maciza de roble boliviano secado al horno con acabado poliuretano mate.',
    iconName: 'table_restaurant',
    carpenterEmail: 'carpintero@carpinteria.com',
    carpenterName: 'Roberto Quispe (Maestro Ebanista)',
  },
  {
    id: 'prod-4',
    name: 'Silla de Comedor Ergonómica Tapizada',
    category: 'Sillas',
    woodType: 'Roble',
    dimensions: '48 x 52 x 92 cm',
    price: 680,
    estimatedDays: 5,
    stock: 12,
    description: 'Estructura espigada en roble con asiento tapizado en lino antimanchas.',
    iconName: 'chair',
    carpenterEmail: 'carpintero@carpinteria.com',
    carpenterName: 'Roberto Quispe (Maestro Ebanista)',
  },
];

// ─── Estado de Red Offline + Eventos ────────────────────────────────────────

function emitNet() {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVT));
}

export function isForceOffline(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(FORCE_OFFLINE_KEY) === '1';
}

export function isOffline(): boolean {
  if (typeof window === 'undefined') return false;
  if (isForceOffline()) return true;
  if (!navigator.onLine) return true;
  if (sessionStorage.getItem(NET_FAIL_KEY) === '1') return true;
  return false;
}

export function toggleForceOffline(val?: boolean): void {
  const next = val ?? !isForceOffline();
  if (next) localStorage.setItem(FORCE_OFFLINE_KEY, '1');
  else {
    localStorage.removeItem(FORCE_OFFLINE_KEY);
    sessionStorage.removeItem(NET_FAIL_KEY);
  }
  emitNet();
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

function readCache<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeCache<T>(key: string, list: T[]): void {
  try {
    if (Array.isArray(list) && list.length > 0) {
      localStorage.setItem(key, JSON.stringify(list));
    }
  } catch {
    // ignore
  }
}

function headers() {
  const token = localStorage.getItem('carpinteria_token')
    ?? (() => { try { return JSON.parse(localStorage.getItem('carpinteria_session') ?? '{}').token; } catch { return null; } })();
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function gql(query: string, variables: Record<string, unknown> = {}) {
  if (isOffline()) throw new Error('OFFLINE_MODE');
  const r = await fetch(GRAPHQL, { method: 'POST', headers: headers(), body: JSON.stringify({ query, variables }) });
  sessionStorage.removeItem(NET_FAIL_KEY);
  emitNet();
  return r.json();
}

export async function checkDeliveryDate(date: string) {
  try {
    if (isOffline()) throw new Error('OFFLINE_MODE');
    const r = await fetch(`${AI}/delivery/check?date=${encodeURIComponent(date)}`, { headers: headers() });
    return r.json();
  } catch {
    return { available: true, remainingCapacity: 3, source: 'offline-local' };
  }
}

export async function scheduleDelivery(orderId: number, date: string) {
  try {
    const json = await gql(
      'mutation($input: ScheduleDeliveryInput!) { scheduleDelivery(input: $input) { id scheduledDate status } }',
      { input: { orderId: String(orderId), scheduledDate: date, timeSlot: 'MORNING' } },
    );
    return json.data?.scheduleDelivery ?? { error: json.errors?.[0]?.message };
  } catch {
    return { id: String(Date.now()), scheduledDate: date, status: 'SCHEDULED' };
  }
}

export async function listDeliveries() {
  try {
    const json = await gql('{ deliveries { id orderId scheduledDate status timeSlot address deliveryType latitude longitude } }');
    const list = json.data?.deliveries ?? [];
    writeCache(KEYS.deliveries, list);
    return list;
  } catch {
    sessionStorage.setItem(NET_FAIL_KEY, '1');
    emitNet();
    return readCache(KEYS.deliveries, []);
  }
}

/** Ficha del carpintero según el email de la sesión (con respaldo offline). */
export async function findMyCarpenter(email: string): Promise<{ id: string; name: string } | null> {
  try {
    const json = await gql('{ carpenters { id name email } }');
    const list = json.data?.carpenters ?? [];
    writeCache(KEYS.carpenters, list);
    const me = list.find(
      (c: any) => c.email?.toLowerCase() === email.toLowerCase(),
    );
    return me ? { id: me.id, name: me.name } : { id: SEED_CARPENTER.id, name: email.split('@')[0] || SEED_CARPENTER.name };
  } catch {
    sessionStorage.setItem(NET_FAIL_KEY, '1');
    emitNet();
    const cached = readCache<any>(KEYS.carpenters, [SEED_CARPENTER]);
    const me = cached.find((c) => c.email?.toLowerCase() === email.toLowerCase()) ?? cached[0] ?? SEED_CARPENTER;
    return { id: String(me.id), name: me.name };
  }
}

/** Mis pedidos asignados con ítems, pasos de producción y entrega (con respaldo offline). */
export async function myOrders(carpenterId: string) {
  try {
    const json = await gql(
      `query($id: ID!) {
        carpenterWorkload(carpenterId: $id) {
          id description status deliveryDate
          client { name }
          items { description quantity furnitureType woodType }
          steps { id name status sequence }
          delivery { scheduledDate timeSlot status address deliveryType latitude longitude }
          deliveryType deliveryAddress deliveryLat deliveryLng
        }
      }`,
      { id: carpenterId },
    );
    const list = (json.data?.carpenterWorkload ?? []) as any[];
    if (list.length > 0) writeCache(KEYS.orders, list);
    return list;
  } catch {
    sessionStorage.setItem(NET_FAIL_KEY, '1');
    emitNet();
    return readCache<any>(KEYS.orders, SEED_WORKSHOP_ORDERS);
  }
}

/** Marcar un paso como empezado o terminado (sincroniza en caché local si está offline). */
export async function updateStep(stepId: string, status: 'IN_PROGRESS' | 'COMPLETED') {
  try {
    const json = await gql(
      'mutation($id: ID!, $status: StepStatus!) { updateStepStatus(stepId: $id, status: $status) { id status } }',
      { id: stepId, status },
    );
    return json.data?.updateStepStatus ?? { error: json.errors?.[0]?.message };
  } catch {
    sessionStorage.setItem(NET_FAIL_KEY, '1');
    emitNet();
    const orders = readCache<any>(KEYS.orders, SEED_WORKSHOP_ORDERS).map((o) => ({
      ...o,
      steps: (o.steps ?? []).map((s: any) => (String(s.id) === String(stepId) ? { ...s, status } : s)),
    }));
    writeCache(KEYS.orders, orders);
    return { id: stepId, status, offline: true };
  }
}

// ─── IA Local del Taller (Asistente Offline para el Carpintero) ─────────────

export function askWorkshopLocalAi(query: string): { answer: string; source: string } {
  const q = query.toLowerCase();
  const orders = readCache<any>(KEYS.orders, SEED_WORKSHOP_ORDERS);
  const products = readCache<MarketplaceProduct>(KEYS.products, SEED_PRODUCTS);
  const activeOrders = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status));

  if (q.includes('hacer hoy') || q.includes('trabajo') || q.includes('pendiente') || q.includes('paso')) {
    if (activeOrders.length === 0) {
      return { source: 'local-ai', answer: '[IA Local Taller] ¡Felicidades! No tienes pedidos pendientes por fabricar hoy.' };
    }
    const lines = activeOrders.map((o) => {
      const nextStep = (o.steps ?? []).find((s: any) => s.status !== 'COMPLETED');
      return `• Pedido #${o.id} (${o.description}) para ${o.client?.name ?? 'Cliente'} → Siguiente paso: ${nextStep?.name ?? 'Listo para entregar'}`;
    });
    return {
      source: 'local-ai',
      answer: `[IA Local Taller — Sin Internet]\nTienes ${activeOrders.length} trabajo(s) activos en tu banco de carpintería:\n${lines.join('\n')}`,
    };
  }

  if (q.includes('entrega') || q.includes('cuándo') || q.includes('cuando') || q.includes('dónde') || q.includes('donde') || q.includes('dirección') || q.includes('direccion')) {
    const withDel = activeOrders.filter((o) => o.delivery?.scheduledDate || o.deliveryDate);
    if (withDel.length === 0) {
      return { source: 'local-ai', answer: '[IA Local Taller] Ninguno de tus pedidos activos tiene fecha de entrega programada todavía.' };
    }
    const next = withDel[0];
    const addr = next.delivery?.address ?? next.deliveryAddress ?? 'Recojo en taller';
    const date = next.delivery?.scheduledDate ?? next.deliveryDate;
    return {
      source: 'local-ai',
      answer: `[IA Local Taller — Sin Internet]\nTu próxima entrega es el pedido #${next.id} (${next.description}):\n• Fecha: ${date}\n• Cliente: ${next.client?.name ?? 'Cliente'}\n• Destino: ${addr}`,
    };
  }

  return {
    source: 'local-ai',
    answer:
      `[IA Local Taller — Modo Offline Activo]\n` +
      `Resumen local en este dispositivo:\n` +
      `• ${activeOrders.length} pedido(s) en fabricación\n` +
      `• ${products.length} mueble(s) publicados en el Marketplace\n` +
      `Pregúntame qué tienes que hacer hoy o a dónde debes llevar tu próxima entrega.`,
  };
}

export async function askAgent(query: string, forceLocal = false) {
  if (forceLocal || isOffline()) {
    return askWorkshopLocalAi(query);
  }
  try {
    const sessionId = localStorage.getItem('agent_session') ??
      (() => { const id = crypto.randomUUID(); localStorage.setItem('agent_session', id); return id; })();
    const r = await fetch(`${AI}/agent`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ query, session_id: sessionId }),
    });
    if (!r.ok) throw new Error('status');
    return r.json();
  } catch {
    sessionStorage.setItem(NET_FAIL_KEY, '1');
    emitNet();
    return askWorkshopLocalAi(query);
  }
}

// ─── Marketplace CRUD & AWS S3 para el Taller (con respaldo Offline) ────────

export async function listProducts(): Promise<MarketplaceProduct[]> {
  try {
    if (isOffline()) throw new Error('OFFLINE_MODE');
    const r = await fetch(`${GATEWAY}/products`, { headers: headers() });
    if (!r.ok) throw new Error('status');
    const list = await r.json();
    writeCache(KEYS.products, list);
    return list;
  } catch {
    return readCache(KEYS.products, SEED_PRODUCTS);
  }
}

export async function createProduct(payload: UpsertProductPayload): Promise<MarketplaceProduct> {
  try {
    if (isOffline()) throw new Error('OFFLINE_MODE');
    const r = await fetch(`${GATEWAY}/products`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('No se pudo publicar el mueble');
    const created = await r.json();
    writeCache(KEYS.products, [created, ...readCache(KEYS.products, SEED_PRODUCTS)]);
    return created;
  } catch {
    const localProd: MarketplaceProduct = {
      id: `taller-${Date.now()}`,
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
    };
    writeCache(KEYS.products, [localProd, ...readCache(KEYS.products, SEED_PRODUCTS)]);
    return localProd;
  }
}

export async function updateProduct(id: string, payload: UpsertProductPayload): Promise<MarketplaceProduct> {
  try {
    if (isOffline()) throw new Error('OFFLINE_MODE');
    const r = await fetch(`${GATEWAY}/products/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('No se pudo actualizar el mueble');
    return r.json();
  } catch {
    const list = readCache(KEYS.products, SEED_PRODUCTS).map((p) => (p.id === id ? { ...p, ...payload } : p));
    writeCache(KEYS.products, list);
    return list.find((p) => p.id === id)!;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    if (isOffline()) throw new Error('OFFLINE_MODE');
    const r = await fetch(`${GATEWAY}/products/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!r.ok) throw new Error('No se pudo eliminar el mueble');
  } catch {
    writeCache(
      KEYS.products,
      readCache(KEYS.products, SEED_PRODUCTS).filter((p) => p.id !== id),
    );
  }
}

export async function uploadImageToS3(file: File, folder = 'marketplace'): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
  try {
    if (isOffline()) throw new Error('OFFLINE_MODE');
    const base64 = dataUrl.split(',')[1];
    const r = await fetch(`${GATEWAY}/uploads/s3`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
        base64,
        folder,
      }),
    });
    if (!r.ok) throw new Error('Error al subir imagen a S3');
    const data = await r.json();
    return data.url;
  } catch {
    return dataUrl;
  }
}
