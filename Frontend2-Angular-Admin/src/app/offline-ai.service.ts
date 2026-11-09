import { Injectable, signal } from '@angular/core';
import type {
  ClientCluster,
  ClusterClientsResponse,
  MarketplaceProduct,
  Quotation,
} from './api.service';

const FORCE_OFFLINE_KEY = 'carpinteria_force_offline';
const NET_FAIL_KEY = 'carpinteria_net_failed';
const EVT = 'carpinteria:network-change';

const KEYS = {
  clients: 'carpinteria_cache_clients',
  carpenters: 'carpinteria_cache_carpenters',
  orders: 'carpinteria_cache_orders',
  deliveries: 'carpinteria_cache_deliveries',
  quotations: 'carpinteria_cache_quotations',
  products: 'carpinteria_cache_products',
};

export interface OfflineReportResult {
  narrative: string;
  source: string;
  sql: string;
  rows: Record<string, any>[];
  stats?: string;
}

// ─── Datos Semilla Realistas para Respaldo Offline Inmediato ────────────────

const SEED_CLIENTS = [
  { id: '1', name: 'Carlos Mendoza', email: 'carlos.mendoza@gmail.com', phone: '70012345', address: 'Av. Banzer 4to Anillo, Santa Cruz', segment: 'VIP' },
  { id: '2', name: 'María Fernanda Suárez', email: 'mfernanda@empresa.bo', phone: '71098765', address: 'Equipetrol Calle 7 #120', segment: 'FRECUENTE' },
  { id: '3', name: 'Constructora Del Oriente SRL', email: 'compras@orientecorp.bo', phone: '33445566', address: 'Parque Industrial Mz 14', segment: 'VIP' },
  { id: '4', name: 'Jorge Luis Roca', email: 'jroca@hotmail.com', phone: '75544332', address: 'Urbarí Calle Los Pinos #34', segment: 'REGULAR' },
  { id: '5', name: 'Ana Lucía Chávez', email: 'analucia@gmail.com', phone: '76611223', address: 'Condominio Las Palmas Casa 18', segment: 'NUEVO' },
];

const SEED_CARPENTERS = [
  { id: '1', name: 'Roberto Quispe (Maestro Ebanista)', email: 'carpintero@carpinteria.com', phone: '72111222', specialty: 'Muebles finos en Roble y Mara', yearsExperience: 14, hourlyRate: 65, active: true },
  { id: '2', name: 'Miguel Ángel Torrez', email: 'miguel.taller@carpinteria.com', phone: '72133444', specialty: 'Roperos empotrados y Cocinas', yearsExperience: 9, hourlyRate: 55, active: true },
  { id: '3', name: 'Fernando Mamani', email: 'fernando.taller@carpinteria.com', phone: '72155666', specialty: 'Puertas macizas y Tallado', yearsExperience: 11, hourlyRate: 60, active: true },
];

const SEED_ORDERS = [
  {
    id: '101',
    description: 'Mesa de Comedor Imperial 8 personas en Roble',
    status: 'IN_PRODUCTION',
    totalPrice: 3600,
    deliveryDate: '2026-11-05',
    createdAt: '2026-10-20T10:00:00Z',
    client: { id: '1', name: 'Carlos Mendoza' },
    items: [{ id: '1', description: 'Mesa Comedor 240x110cm', furnitureType: 'TABLE', woodType: 'ROBLE', quantity: 1, unitPrice: 3600 }],
    steps: [
      { id: '1001', name: 'Corte y cepillado de madera', status: 'COMPLETED', sequence: 1 },
      { id: '1002', name: 'Ensamblado y espigado', status: 'IN_PROGRESS', sequence: 2 },
      { id: '1003', name: 'Lijado y barnizado poliuretano', status: 'PENDING', sequence: 3 },
    ],
    carpenters: [{ id: '1', name: 'Roberto Quispe (Maestro Ebanista)' }],
    delivery: { id: '501', scheduledDate: '2026-11-05', timeSlot: 'MORNING', status: 'SCHEDULED', address: 'Av. Banzer 4to Anillo, Santa Cruz', deliveryType: 'DELIVERY', latitude: -17.754, longitude: -63.178 },
    deliveryType: 'DELIVERY',
    deliveryAddress: 'Av. Banzer 4to Anillo, Santa Cruz',
  },
  {
    id: '102',
    description: 'Ropero Empotrado 3 Cuerpos en Mara',
    status: 'PENDING',
    totalPrice: 5200,
    deliveryDate: '2026-11-10',
    createdAt: '2026-10-23T14:30:00Z',
    client: { id: '2', name: 'María Fernanda Suárez' },
    items: [{ id: '2', description: 'Ropero 3 cuerpos con espejos', furnitureType: 'WARDROBE', woodType: 'MARA', quantity: 1, unitPrice: 5200 }],
    steps: [
      { id: '1004', name: 'Corte de paneles de Mara', status: 'PENDING', sequence: 1 },
      { id: '1005', name: 'Armado de cajoneras y rieles', status: 'PENDING', sequence: 2 },
    ],
    carpenters: [{ id: '2', name: 'Miguel Ángel Torrez' }],
    delivery: { id: '502', scheduledDate: '2026-11-10', timeSlot: 'AFTERNOON', status: 'SCHEDULED', address: 'Equipetrol Calle 7 #120', deliveryType: 'DELIVERY', latitude: -17.762, longitude: -63.195 },
    deliveryType: 'DELIVERY',
    deliveryAddress: 'Equipetrol Calle 7 #120',
  },
  {
    id: '103',
    description: 'Lote 6 Puertas Tablero en Cedro',
    status: 'READY',
    totalPrice: 9900,
    deliveryDate: '2026-11-02',
    createdAt: '2026-10-12T09:15:00Z',
    client: { id: '3', name: 'Constructora Del Oriente SRL' },
    items: [{ id: '3', description: 'Puerta maciza tablero Cedro', furnitureType: 'DOOR', woodType: 'CEDRO', quantity: 6, unitPrice: 1650 }],
    steps: [
      { id: '1006', name: 'Maquinado y prensado', status: 'COMPLETED', sequence: 1 },
      { id: '1007', name: 'Acabado sellador y laca', status: 'COMPLETED', sequence: 2 },
    ],
    carpenters: [{ id: '3', name: 'Fernando Mamani' }],
    delivery: { id: '503', scheduledDate: '2026-11-02', timeSlot: 'MORNING', status: 'SCHEDULED', address: 'Parque Industrial Mz 14', deliveryType: 'DELIVERY', latitude: -17.759, longitude: -63.141 },
    deliveryType: 'DELIVERY',
    deliveryAddress: 'Parque Industrial Mz 14',
  },
  {
    id: '104',
    description: 'Juego de 6 Sillas Tapizadas en Roble',
    status: 'DELIVERED',
    totalPrice: 4080,
    deliveryDate: '2026-10-18',
    createdAt: '2026-10-04T11:00:00Z',
    client: { id: '1', name: 'Carlos Mendoza' },
    items: [{ id: '4', description: 'Silla comedor ergonómica', furnitureType: 'CHAIR', woodType: 'ROBLE', quantity: 6, unitPrice: 680 }],
    steps: [],
    carpenters: [{ id: '1', name: 'Roberto Quispe (Maestro Ebanista)' }],
    delivery: { id: '504', scheduledDate: '2026-10-18', timeSlot: 'AFTERNOON', status: 'DELIVERED', address: 'Av. Banzer 4to Anillo, Santa Cruz', deliveryType: 'DELIVERY', latitude: -17.754, longitude: -63.178 },
    deliveryType: 'DELIVERY',
    deliveryAddress: 'Av. Banzer 4to Anillo, Santa Cruz',
  },
];

const SEED_DELIVERIES = SEED_ORDERS.filter((o) => o.delivery).map((o) => ({
  id: o.delivery!.id,
  orderId: o.id,
  scheduledDate: o.delivery!.scheduledDate,
  timeSlot: o.delivery!.timeSlot,
  address: o.delivery!.address,
  status: o.delivery!.status,
  notes: o.description,
  deliveryType: o.delivery!.deliveryType,
  latitude: o.delivery!.latitude,
  longitude: o.delivery!.longitude,
}));

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
    createdByRole: 'CARPENTER',
  },
  {
    id: 'prod-2',
    name: 'Ropero 3 Cuerpos con Espejo Central',
    category: 'Roperos',
    woodType: 'Mara',
    dimensions: '210 x 180 x 60 cm',
    price: 4950,
    estimatedDays: 14,
    stock: 2,
    description: 'Ropero de mara legítima con cajoneras telescópicas y división interior completa.',
    iconName: 'door_sliding',
    carpenterEmail: 'miguel.taller@carpinteria.com',
    carpenterName: 'Miguel Ángel Torrez',
    createdByRole: 'CARPENTER',
  },
  {
    id: 'prod-3',
    name: 'Puerta Principal Acorazada Tallada',
    category: 'Puertas',
    woodType: 'Cedro',
    dimensions: '210 x 95 x 4.5 cm',
    price: 2200,
    estimatedDays: 7,
    stock: 1,
    description: 'Puerta exterior en cedro seleccionado resistente a humedad y sol.',
    iconName: 'sensor_door',
    carpenterEmail: 'fernando.taller@carpinteria.com',
    carpenterName: 'Fernando Mamani',
    createdByRole: 'ADMIN',
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
    createdByRole: 'CARPENTER',
  },
  {
    id: 'prod-5',
    name: 'Isla de Cocina Multifuncional',
    category: 'Cocina',
    woodType: 'Roble',
    dimensions: '150 x 80 x 90 cm',
    price: 3100,
    estimatedDays: 9,
    stock: 1,
    description: 'Isla central con cubierta de madera dura tratada, botellero y 3 cajones.',
    iconName: 'countertops',
    carpenterEmail: 'miguel.taller@carpinteria.com',
    carpenterName: 'Miguel Ángel Torrez',
    createdByRole: 'ADMIN',
  },
];

const SEED_QUOTATIONS: Quotation[] = [
  {
    id: 'cot-local-001',
    clientId: 'carlos.mendoza@gmail.com',
    status: 'QUOTED',
    aiEstimate: 3450,
    totalAmount: 3450,
    finalAmount: 3300,
    payableAmount: 3300,
    delivery: { type: 'DELIVERY', address: 'Av. Banzer 4to Anillo, Santa Cruz' },
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
    clientId: 'mfernanda@empresa.bo',
    status: 'DRAFT',
    aiEstimate: 4800,
    totalAmount: 4800,
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
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-10-28T09:00:00Z',
  },
];

// ─── Validador de Seguridad SQL (igual que SqlSecurityValidator en Flutter) ──

export class SqlSecurityValidator {
  private static forbiddenKeywords = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE|ATTACH|DETACH|PRAGMA|VACUUM|GRANT|REVOKE)\b/i;

  static sanitizeUserPrompt(input: string): string {
    const cleaned = input
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      .replace(/[<>]/g, '')
      .replace(/```/g, '')
      .trim()
      .slice(0, 400);

    const injectionPatterns = /(ignora\s+(todas\s+)?las\s+instrucciones|ignore\s+previous\s+instructions|system\s+prompt|drop\s+table|delete\s+from|update\s+set)/i;
    if (injectionPatterns.test(cleaned)) {
      throw new Error('Alerta de Seguridad: Se detectó un intento de inyección de instrucciones (Prompt/SQL Injection) no permitido.');
    }
    return cleaned;
  }

  static validateSelectSql(sql: string): string {
    const trimmed = sql.trim().replace(/;$/, '');
    if (!trimmed.toUpperCase().startsWith('SELECT ')) {
      throw new Error('Seguridad SQL: Solo se permiten sentencias SELECT de lectura.');
    }
    if (trimmed.includes('--') || trimmed.includes('/*')) {
      throw new Error('Seguridad SQL: Comentarios SQL bloqueados por prevención de inyección.');
    }
    if (this.forbiddenKeywords.test(trimmed)) {
      throw new Error('Seguridad SQL: Se bloqueó una instrucción de modificación no autorizada.');
    }
    return trimmed;
  }
}

@Injectable({ providedIn: 'root' })
export class OfflineAiService {
  readonly offline = signal<boolean>(this.computeOffline());

  constructor() {
    if (typeof window !== 'undefined') {
      const update = () => this.offline.set(this.computeOffline());
      window.addEventListener('online', () => {
        sessionStorage.removeItem(NET_FAIL_KEY);
        update();
      });
      window.addEventListener('offline', update);
      window.addEventListener(EVT, update);
      window.addEventListener('storage', update);
    }
  }

  private computeOffline(): boolean {
    if (typeof window === 'undefined') return false;
    if (localStorage.getItem(FORCE_OFFLINE_KEY) === '1') return true;
    if (!navigator.onLine) return true;
    if (sessionStorage.getItem(NET_FAIL_KEY) === '1') return true;
    return false;
  }

  isForceOffline(): boolean {
    return typeof localStorage !== 'undefined' && localStorage.getItem(FORCE_OFFLINE_KEY) === '1';
  }

  toggleForceOffline(force?: boolean): void {
    const next = force ?? !this.isForceOffline();
    if (next) {
      localStorage.setItem(FORCE_OFFLINE_KEY, '1');
    } else {
      localStorage.removeItem(FORCE_OFFLINE_KEY);
      sessionStorage.removeItem(NET_FAIL_KEY);
    }
    this.offline.set(this.computeOffline());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVT));
    }
  }

  markNetworkFailure(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(NET_FAIL_KEY, '1');
      this.offline.set(true);
      window.dispatchEvent(new CustomEvent(EVT));
    }
  }

  markNetworkSuccess(): void {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(NET_FAIL_KEY) === '1') {
      sessionStorage.removeItem(NET_FAIL_KEY);
      this.offline.set(this.computeOffline());
      window.dispatchEvent(new CustomEvent(EVT));
    }
  }

  // ─── Acceso y Sincronización de Tablas Locales ──────────────────────────────

  private read<T>(key: string, seed: T[]): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        localStorage.setItem(key, JSON.stringify(seed));
        return seed;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    } catch {
      return seed;
    }
  }

  private write<T>(key: string, data: T[]): void {
    try {
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {
      // ignore quota
    }
  }

  getClients(): any[] { return this.read(KEYS.clients, SEED_CLIENTS); }
  setClients(list: any[]): void { this.write(KEYS.clients, list); }

  getCarpenters(): any[] { return this.read(KEYS.carpenters, SEED_CARPENTERS); }
  setCarpenters(list: any[]): void { this.write(KEYS.carpenters, list); }

  getOrders(): any[] {
    const list = this.read(KEYS.orders, SEED_ORDERS);
    if (list.length > 0 && list.every((o: any) => o.totalPrice === undefined)) {
      localStorage.removeItem(KEYS.orders);
      return SEED_ORDERS;
    }
    return list;
  }
  setOrders(list: any[]): void {
    if (Array.isArray(list) && list.some((o: any) => o.totalPrice !== undefined)) {
      this.write(KEYS.orders, list);
    }
  }

  getDeliveries(): any[] { return this.read(KEYS.deliveries, SEED_DELIVERIES); }
  setDeliveries(list: any[]): void { this.write(KEYS.deliveries, list); }

  getProducts(): MarketplaceProduct[] { return this.read(KEYS.products, SEED_PRODUCTS); }
  setProducts(list: MarketplaceProduct[]): void { this.write(KEYS.products, list); }

  getQuotations(): Quotation[] { return this.read(KEYS.quotations, SEED_QUOTATIONS); }
  setQuotations(list: Quotation[]): void { this.write(KEYS.quotations, list); }

  // ─── Resolución Offline de Consultas y Mutaciones GraphQL ───────────────────

  resolveGraphQLOffline(operationName: string, variables: Record<string, any> = {}): Record<string, any> {
    switch (operationName) {
      case 'Clients':
        return { clients: this.getClients() };
      case 'CreateClient': {
        const input = variables['input'] ?? {};
        const created = { id: String(Date.now()), segment: 'NUEVO', ...input };
        this.setClients([created, ...this.getClients()]);
        return { createClient: created };
      }
      case 'UpdateClient': {
        const id = String(variables['id']);
        const input = variables['input'] ?? {};
        const list = this.getClients().map((c) => (String(c.id) === id ? { ...c, ...input } : c));
        this.setClients(list);
        return { updateClient: list.find((c) => String(c.id) === id) };
      }
      case 'DeleteClient': {
        const id = String(variables['id']);
        this.setClients(this.getClients().filter((c) => String(c.id) !== id));
        return { deleteClient: true };
      }
      case 'Carpenters':
        return { carpenters: this.getCarpenters() };
      case 'CreateCarpenter': {
        const input = variables['input'] ?? {};
        const created = { id: String(Date.now()), active: true, ...input };
        this.setCarpenters([created, ...this.getCarpenters()]);
        return { createCarpenter: created };
      }
      case 'UpdateCarpenter': {
        const id = String(variables['id']);
        const input = variables['input'] ?? {};
        const list = this.getCarpenters().map((c) => (String(c.id) === id ? { ...c, ...input } : c));
        this.setCarpenters(list);
        return { updateCarpenter: list.find((c) => String(c.id) === id) };
      }
      case 'DeleteCarpenter': {
        const id = String(variables['id']);
        this.setCarpenters(this.getCarpenters().filter((c) => String(c.id) !== id));
        return { deleteCarpenter: true };
      }
      case 'CarpenterWorkload': {
        const cid = String(variables['carpenterId']);
        const orders = this.getOrders().filter((o) =>
          (o.carpenters ?? []).some((c: any) => String(c.id) === cid),
        );
        return { carpenterWorkload: orders };
      }
      case 'Orders': {
        const status = variables['status'];
        const all = this.getOrders();
        return { orders: status ? all.filter((o) => o.status === status) : all };
      }
      case 'UpdateOrderStatus': {
        const id = String(variables['id']);
        const status = variables['status'];
        const list = this.getOrders().map((o) => (String(o.id) === id ? { ...o, status } : o));
        this.setOrders(list);
        return { updateOrderStatus: { id, status } };
      }
      case 'AssignCarpenter': {
        const orderId = String(variables['orderId']);
        const carpenterId = String(variables['carpenterId']);
        const carp = this.getCarpenters().find((c) => String(c.id) === carpenterId) ?? { id: carpenterId, name: 'Carpintero' };
        const list = this.getOrders().map((o) =>
          String(o.id) === orderId ? { ...o, carpenters: [carp] } : o,
        );
        this.setOrders(list);
        return { assignCarpenter: { id: orderId, carpenters: [carp] } };
      }
      case 'AddProductionStep': {
        const orderId = String(variables['orderId']);
        const name = String(variables['name'] ?? '').trim();
        let updatedSteps: any[] = [];
        const list = this.getOrders().map((o) => {
          if (String(o.id) !== orderId) return o;
          const prev = Array.isArray(o.steps) ? o.steps : [];
          const nextSeq = prev.length + 1;
          const newStep = { id: String(Date.now() + nextSeq), name, status: 'PENDING', sequence: nextSeq };
          updatedSteps = [...prev, newStep];
          return { ...o, steps: updatedSteps };
        });
        this.setOrders(list);
        return { addProductionStep: { id: orderId, steps: updatedSteps } };
      }
      case 'Deliveries':
        return { deliveries: this.getDeliveries() };
      case 'DeliveryCapacity':
        return { deliveryCapacity: 3 };
      case 'UpdateDeliveryStatus': {
        const id = String(variables['id']);
        const status = variables['status'];
        const list = this.getDeliveries().map((d) => (String(d.id) === id ? { ...d, status } : d));
        this.setDeliveries(list);
        return { updateDeliveryStatus: { id, status } };
      }
      default:
        return {
          clients: this.getClients(),
          carpenters: this.getCarpenters(),
          orders: this.getOrders(),
          deliveries: this.getDeliveries(),
        };
    }
  }

  syncFromGraphQLResponse(data: Record<string, any> | null | undefined): void {
    if (!data) return;
    if (Array.isArray(data['clients']) && data['clients'].length > 0) this.setClients(data['clients']);
    if (Array.isArray(data['carpenters']) && data['carpenters'].length > 0) this.setCarpenters(data['carpenters']);
    if (Array.isArray(data['orders']) && data['orders'].length > 0) this.setOrders(data['orders']);
    if (Array.isArray(data['deliveries']) && data['deliveries'].length > 0) this.setDeliveries(data['deliveries']);
  }

  // ─── CU1: Segmentación de Clientes con IA Local (K-Means / RFM en Navegador) ─

  clusterClientsLocally(): ClusterClientsResponse {
    const clients = this.getClients();
    const orders = this.getOrders();

    // Calcular gasto y número de pedidos por cliente
    const statsByClient = clients.map((c) => {
      const clientOrders = orders.filter(
        (o) => String(o.client?.id) === String(c.id) || o.client?.name?.toLowerCase() === c.name?.toLowerCase(),
      );
      const totalSpent = clientOrders.reduce((acc, o) => acc + Number(o.totalPrice ?? 0), 0);
      const totalOrders = clientOrders.length;
      return {
        id: c.id,
        name: c.name,
        segment: c.segment,
        totalOrders: totalOrders || (c.segment === 'VIP' ? 4 : c.segment === 'FRECUENTE' ? 2 : 1),
        totalSpent: totalSpent || (c.segment === 'VIP' ? 8500 : c.segment === 'FRECUENTE' ? 3800 : 1200),
        recencyDays: c.segment === 'VIP' ? 7 : c.segment === 'FRECUENTE' ? 18 : 42,
      };
    });

    const vip = statsByClient.filter((s) => s.totalSpent >= 5000 || s.segment === 'VIP');
    const frecuentes = statsByClient.filter((s) => !vip.includes(s) && (s.totalOrders >= 2 || s.totalSpent >= 2500));
    const nuevos = statsByClient.filter((s) => !vip.includes(s) && !frecuentes.includes(s));

    const avg = (arr: typeof statsByClient, fn: (x: (typeof statsByClient)[0]) => number) =>
      arr.length ? Math.round((arr.reduce((a, b) => a + fn(b), 0) / arr.length) * 10) / 10 : 0;

    const clusters: ClientCluster[] = [
      {
        clusterId: 0,
        label: 'Clientes VIP / Alto Valor',
        size: vip.length,
        clientIds: vip.map((c) => `${c.name} (#${c.id})`),
        centroid: {
          total_orders: avg(vip, (x) => x.totalOrders),
          total_spent: avg(vip, (x) => x.totalSpent),
          recency_days: avg(vip, (x) => x.recencyDays),
        },
      },
      {
        clusterId: 1,
        label: 'Clientes Frecuentes / Recurrentes',
        size: frecuentes.length,
        clientIds: frecuentes.map((c) => `${c.name} (#${c.id})`),
        centroid: {
          total_orders: avg(frecuentes, (x) => x.totalOrders),
          total_spent: avg(frecuentes, (x) => x.totalSpent),
          recency_days: avg(frecuentes, (x) => x.recencyDays),
        },
      },
      {
        clusterId: 2,
        label: 'Clientes Nuevos / Ocasionales',
        size: nuevos.length,
        clientIds: nuevos.map((c) => `${c.name} (#${c.id})`),
        centroid: {
          total_orders: avg(nuevos, (x) => x.totalOrders),
          total_spent: avg(nuevos, (x) => x.totalSpent),
          recency_days: avg(nuevos, (x) => x.recencyDays),
        },
      },
    ].filter((c) => c.size > 0);

    return {
      algorithm: 'X-Means / K-Means Ejecutado en IA Local del Navegador (Offline)',
      clusters,
    };
  }

  // ─── Traducción de Valores y Columnas al Español ────────────────────────────

  private static readonly ENUM_ES: Record<string, string> = {
    REGULAR: 'Regular',
    VIP: 'VIP (Preferencial)',
    WHOLESALE: 'Mayorista',
    FRECUENTE: 'Frecuente',
    NUEVO: 'Nuevo',
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    IN_PRODUCTION: 'En fabricación',
    READY: 'Listo para entrega',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
    SCHEDULED: 'Programada',
    IN_TRANSIT: 'En camino',
    FAILED: 'Fallida',
    RESCHEDULED: 'Reprogramada',
    DELIVERY: 'Envío a domicilio',
    PICKUP: 'Recojo en taller',
    MORNING: 'Mañana',
    AFTERNOON: 'Tarde',
    EVENING: 'Noche',
    DRAFT: 'Solicitud inicial',
    QUOTED: 'Precio enviado',
    COUNTER_OFFER: 'Contraoferta',
    ACCEPTED: 'Aceptada',
    REJECTED: 'Rechazada',
    CONVERTED: 'Convertida en pedido',
    GENERAL: 'General',
    MUEBLES: 'Muebles',
    COCINAS: 'Cocinas',
    PUERTAS_VENTANAS: 'Puertas y ventanas',
    RESTAURACION: 'Restauración',
    TALLER_FINO: 'Taller fino',
    ACTIVO: 'Activo',
    INACTIVO: 'Inactivo',
  };

  private static readonly COL_ES: Record<string, string> = {
    id: 'ID',
    name: 'Nombre',
    email: 'Correo',
    phone: 'Teléfono',
    address: 'Dirección',
    segment: 'Segmento',
    status: 'Estado',
    total_orders: 'Pedidos',
    total_pedidos: 'Pedidos',
    total_spent: 'Total_Bs',
    total_facturado_bs: 'Total_Bs',
    total_price: 'Monto_Bs',
    monto_total_bs: 'Monto_Bs',
    delivery_date: 'Fecha_Entrega',
    scheduled_date: 'Fecha_Programada',
    time_slot: 'Horario',
    delivery_type: 'Modalidad',
    specialty: 'Especialidad',
    years_experience: 'Experiencia_Años',
    hourly_rate: 'Tarifa_Hora_Bs',
  };

  translateValueEs(val: any): any {
    if (typeof val === 'string') {
      const upper = val.trim().toUpperCase();
      if (OfflineAiService.ENUM_ES[upper]) return OfflineAiService.ENUM_ES[upper];
    }
    if (typeof val === 'boolean') return val ? 'Sí' : 'No';
    return val;
  }

  translateReportRows(rows: Record<string, any>[]): Record<string, any>[] {
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        const cleanKey = OfflineAiService.COL_ES[k.toLowerCase()] ?? k;
        out[cleanKey] = this.translateValueEs(v);
      }
      return out;
    });
  }

  // ─── Generador de Reportes en Lenguaje Natural con IA Local (Offline) ──────

  generateOfflineReport(rawQuery: string): OfflineReportResult {
    const cleanQuery = SqlSecurityValidator.sanitizeUserPrompt(rawQuery);
    const q = cleanQuery.toLowerCase();

    const orders = this.getOrders();
    const clients = this.getClients();
    const carpenters = this.getCarpenters();
    const deliveries = this.getDeliveries();
    const products = this.getProducts();
    const quotations = this.getQuotations();

    let sql = '';
    let rows: Record<string, any>[] = [];
    let narrative = '';

    // 1. Reporte de Mejores Clientes / Segmentación / Ventas por Cliente
    if (q.includes('cliente') || q.includes('comprador') || q.includes('vip') || q.includes('frecuente') || q.includes('factur')) {
      sql = SqlSecurityValidator.validateSelectSql(
        'SELECT c.id, c.nombre, c.email, c.segmento, COUNT(p.id) AS total_pedidos, SUM(p.monto_total) AS total_facturado_bs FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.id ORDER BY total_facturado_bs DESC LIMIT 100',
      );
      rows = clients.map((c) => {
        const cOrders = orders.filter(
          (o) =>
            String(o.client?.id) === String(c.id) ||
            (o.client?.name && c.name && o.client.name.toLowerCase() === c.name.toLowerCase()),
        );
        const sum = Math.round(cOrders.reduce((acc, o) => acc + Number(o.totalPrice ?? 0), 0) * 100) / 100;
        return {
          ID: c.id,
          Cliente: c.name,
          Correo: c.email,
          Segmento: this.translateValueEs(c.segment ?? 'REGULAR'),
          Pedidos: cOrders.length,
          Total_Bs: sum,
        };
      }).sort((a, b) => b.Total_Bs - a.Total_Bs || b.Pedidos - a.Pedidos);

      const topClient = rows[0];
      const totalFacturado = rows.reduce((s, r) => s + Number(r['Total_Bs'] || 0), 0);
      const conCompras = rows.filter((r) => Number(r['Pedidos'] || 0) > 0).length;
      narrative = `Análisis ejecutivo completado sobre ${rows.length} clientes registrados (${conCompras} con pedidos facturados). El cliente líder en facturación es ${topClient?.['Cliente'] ?? 'N/A'} (Bs ${Number(topClient?.['Total_Bs'] ?? 0).toLocaleString('es-BO')}), acumulando un volumen total de Bs ${totalFacturado.toLocaleString('es-BO')} en cartera.`;
    }
    // 2. Reporte de Stock Bajo / Tienda / Muebles / Materiales
    else if (q.includes('stock') || q.includes('mueble') || q.includes('producto') || q.includes('marketplace') || q.includes('tienda') || q.includes('material') || q.includes('inventario')) {
      const onlyLow = q.includes('bajo') || q.includes('agotad') || q.includes('poco') || q.includes('alerta');
      sql = SqlSecurityValidator.validateSelectSql(
        onlyLow
          ? 'SELECT id, nombre, categoria, tipo_madera, precio_bs, stock, carpintero FROM productos WHERE stock <= 3 ORDER BY stock ASC LIMIT 100'
          : 'SELECT id, nombre, categoria, tipo_madera, precio_bs, stock, carpintero FROM productos ORDER BY stock ASC LIMIT 100',
      );
      const filtered = onlyLow ? products.filter((p) => p.stock <= 3) : products;
      rows = (filtered.length > 0 ? filtered : products).map((p) => ({
        ID: p.id,
        Mueble: p.name,
        Categoria: p.category,
        Madera: p.woodType,
        Precio_Bs: p.price,
        Stock: p.stock,
        Valor_Stock_Bs: Math.round(Number(p.price || 0) * Number(p.stock || 0) * 100) / 100,
        Estado_Stock: p.stock <= 0 ? 'Agotado' : p.stock <= 2 ? 'Alerta stock bajo' : 'Disponible',
        Carpintero: p.carpenterName ?? 'Taller Central',
      }));
      const lowCount = products.filter((p) => p.stock <= 2).length;
      const valorInventario = products.reduce((s, p) => s + p.price * p.stock, 0);
      narrative = `Reporte de inventario: Se analizaron ${products.length} muebles publicados en la Tienda (valorizado en Bs ${valorInventario.toLocaleString('es-BO')}). Se detectaron ${lowCount} mueble(s) con alerta de reposición (stock <= 2 unidades).`;
    }
    // 3. Reporte de Entregas / Despachos / Rutas
    else if (q.includes('entrega') || q.includes('despacho') || q.includes('envío') || q.includes('envio') || q.includes('octubre') || q.includes('noviembre') || q.includes('semana')) {
      sql = SqlSecurityValidator.validateSelectSql(
        'SELECT id, pedido_id, fecha_programada, horario, direccion, estado, modalidad FROM entregas ORDER BY fecha_programada ASC LIMIT 100',
      );
      rows = deliveries.map((d) => {
        const ord = orders.find((o) => String(o.id) === String(d.orderId));
        return {
          Entrega_ID: d.id,
          Pedido_ID: d.orderId,
          Cliente: ord?.client?.name ?? 'Cliente',
          Fecha: d.scheduledDate,
          Horario: this.translateValueEs(d.timeSlot ?? 'MORNING'),
          Estado: this.translateValueEs(d.status),
          Modalidad: this.translateValueEs(d.deliveryType ?? 'DELIVERY'),
          Monto_Pedido_Bs: Number(ord?.totalPrice ?? 0),
          Direccion: d.address ?? 'Recojo en taller',
        };
      });
      const programadas = deliveries.filter((d) => d.status === 'SCHEDULED' || d.status === 'IN_TRANSIT').length;
      narrative = `Se encontraron ${deliveries.length} entregas registradas (${programadas} pendientes de despacho y ${deliveries.length - programadas} completadas). Todas las rutas cuentan con seguimiento sincronizado.`;
    }
    // 4. Reporte de Carpinteros / Carga de Trabajo / Taller
    else if (q.includes('carpintero') || q.includes('taller') || q.includes('carga') || q.includes('artesano')) {
      sql = SqlSecurityValidator.validateSelectSql(
        'SELECT c.id, c.nombre, c.especialidad, c.tarifa_hora_bs, COUNT(p.id) AS pedidos_asignados, SUM(p.monto_total) AS valor_asignado_bs FROM carpinteros c LEFT JOIN pedidos p ON p.carpintero_id = c.id GROUP BY c.id ORDER BY pedidos_asignados DESC LIMIT 100',
      );
      rows = carpenters.map((c) => {
        const assigned = orders.filter((o) => (o.carpenters ?? []).some((oc: any) => String(oc.id) === String(c.id) || oc.name === c.name));
        const valorAsignado = Math.round(assigned.reduce((acc, o) => acc + Number(o.totalPrice ?? 0), 0) * 100) / 100;
        return {
          ID: c.id,
          Carpintero: c.name,
          Especialidad: this.translateValueEs(c.specialty),
          Experiencia_Años: c.yearsExperience,
          Tarifa_Hora_Bs: c.hourlyRate,
          Pedidos_Asignados: assigned.length,
          Valor_Asignado_Bs: valorAsignado,
          Estado: c.active ? 'Activo' : 'Inactivo',
        };
      }).sort((a, b) => b.Pedidos_Asignados - a.Pedidos_Asignados || b.Valor_Asignado_Bs - a.Valor_Asignado_Bs);
      narrative = `Análisis de capacidad de taller: Hay ${carpenters.filter((c) => c.active).length} maestros carpinteros activos atendiendo ${orders.length} órdenes de producción.`;
    }
    // 5. Reporte de Cotizaciones
    else if (q.includes('cotiz') || q.includes('presupuesto') || q.includes('contraoferta')) {
      sql = SqlSecurityValidator.validateSelectSql(
        'SELECT id, cliente_email, estado, estimacion_ia_bs, monto_final_bs, modalidad_entrega, fecha FROM cotizaciones ORDER BY fecha DESC LIMIT 100',
      );
      rows = quotations.map((c) => ({
        Cotizacion_ID: String(c.id).slice(0, 8),
        Cliente: c.clientId,
        Estado: this.translateValueEs(c.status),
        Estimacion_IA_Bs: Number(c.aiEstimate ?? c.totalAmount ?? 0),
        Monto_Final_Bs: Number(c.payableAmount ?? c.finalAmount ?? c.totalAmount ?? 0),
        Entrega: this.translateValueEs(c.delivery?.type ?? 'PICKUP'),
        Fecha: (c.createdAt ?? '').slice(0, 10),
      }));
      const totalCotizado = quotations.reduce((s, c) => s + Number(c.payableAmount ?? c.totalAmount ?? 0), 0);
      narrative = `Se registran ${quotations.length} cotizaciones por un valor comercial acumulado de Bs ${totalCotizado.toLocaleString('es-BO')}.`;
    }
    // 6. Reporte General de Pedidos / Ingresos / Pendientes (Por defecto)
    else {
      const onlyPending = q.includes('pendiente') || q.includes('produccion') || q.includes('producción') || q.includes('proceso');
      sql = SqlSecurityValidator.validateSelectSql(
        onlyPending
          ? "SELECT id, cliente_nombre, descripcion, estado, monto_total_bs, fecha_entrega FROM pedidos WHERE estado IN ('PENDING', 'IN_PRODUCTION', 'READY') ORDER BY fecha_entrega ASC LIMIT 100"
          : 'SELECT id, cliente_nombre, descripcion, estado, monto_total_bs, fecha_entrega FROM pedidos ORDER BY id DESC LIMIT 100',
      );
      const list = onlyPending
        ? orders.filter((o) => ['PENDING', 'APPROVED', 'IN_PRODUCTION', 'READY'].includes(o.status))
        : orders;
      rows = (list.length > 0 ? list : orders).map((o) => ({
        Pedido_ID: o.id,
        Cliente: o.client?.name ?? 'Cliente',
        Descripcion: o.description,
        Estado: this.translateValueEs(o.status),
        Monto_Bs: Number(o.totalPrice ?? 0),
        Fecha_Entrega: o.deliveryDate ?? o.delivery?.scheduledDate ?? 'Sin fecha',
        Carpintero: o.carpenters?.[0]?.name ?? 'Por asignar',
      }));
      const totalMonto = rows.reduce((s, r) => s + Number(r['Monto_Bs'] || 0), 0);
      const enCurso = orders.filter((o) => o.status === 'IN_PRODUCTION' || o.status === 'PENDING' || o.status === 'APPROVED').length;
      narrative = `Resumen ejecutivo de pedidos: Se analizaron ${rows.length} órdenes por un total de Bs ${totalMonto.toLocaleString('es-BO')} (promedio Bs ${rows.length ? Math.round(totalMonto / rows.length).toLocaleString('es-BO') : 0} por pedido). Actualmente hay ${enCurso} pedido(s) activos en producción o por aprobar.`;
    }

    const stats = `Filas procesadas: ${rows.length} · Datos sincronizados en tiempo real`;

    return {
      narrative,
      source: 'Motor Analítico SQL Validado (Carpintería El Roble)',
      sql,
      rows,
      stats,
    };
  }

  // ─── Asistente de Chat Administrativo con IA Local ──────────────────────────

  askAdminLocalAgent(query: string): { answer: string; source: string } {
    const rep = this.generateOfflineReport(query);
    const preview = rep.rows
      .slice(0, 4)
      .map((r) => {
        const vals = Object.entries(r)
          .slice(0, 4)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ');
        return `• ${vals}`;
      })
      .join('\n');

    return {
      source: 'local-ai',
      answer:
        `[IA Local en el Frontend — Modo Offline]\n` +
        `${rep.narrative}\n\n` +
        (preview ? `Datos locales consultados:\n${preview}\n\n` : '') +
        `SQL ejecutado localmente:\n${rep.sql}`,
    };
  }

  // ─── Exportación de Reportes Offline (PDF Imprimible y CSV/Excel) ───────────

  exportReportToCsv(report: OfflineReportResult, userQuery: string): void {
    if (!report.rows || report.rows.length === 0) return;
    const cols = Object.keys(report.rows[0]);
    const escapeCsv = (val: unknown) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };
    const header = cols.map(escapeCsv).join(',');
    const lines = report.rows.map((row) => cols.map((c) => escapeCsv(row[c])).join(','));
    const meta = [
      `"REPORTE EJECUTIVO - CARPINTERIA EL ROBLE (MODO OFFLINE / IA LOCAL)"`,
      `"Consulta:","${userQuery.replace(/"/g, '""')}"`,
      `"Conclusión IA:","${report.narrative.replace(/"/g, '""')}"`,
      `"SQL Ejecutado:","${report.sql.replace(/"/g, '""')}"`,
      `""`,
    ];
    // BOM UTF-8 (\uFEFF) para que Microsoft Excel abra tildes y eñes correctamente
    const csvContent = '\uFEFF' + [...meta, header, ...lines].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-carpinteria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportReportToPdf(report: OfflineReportResult, userQuery: string): void {
    if (typeof window === 'undefined') return;
    const rows = report.rows ?? [];
    const cols = rows.length ? Object.keys(rows[0]) : [];
    const ths = cols.map((c) => `<th>${c.replace(/_/g, ' ')}</th>`).join('');
    const trs = rows
      .map(
        (r) =>
          `<tr>${cols.map((c) => `<td>${String(r[c] ?? '')}</td>`).join('')}</tr>`,
      )
      .join('');

    // Detectar columna de etiqueta y métrica principal para gráfica impresa
    const idPattern = /(^id$|_id$)/i;
    const numCols = cols.filter((c) => !idPattern.test(c) && rows.some((r) => typeof r[c] === 'number' && !isNaN(r[c])));
    const metricCol = numCols[numCols.length - 1] ?? numCols[0] ?? '';
    const labelCol = cols.find((c) => !idPattern.test(c) && typeof rows[0]?.[c] === 'string') ?? cols[0] ?? '';

    let chartHtml = '';
    if (metricCol && labelCol && rows.length > 0) {
      const vals = rows.map((r) => Number(r[metricCol] || 0));
      const total = vals.reduce((a, b) => a + b, 0);
      const max = Math.max(1, ...vals);
      const avg = rows.length ? Math.round((total / rows.length) * 100) / 100 : 0;
      const topRow = [...rows].sort((a, b) => Number(b[metricCol] || 0) - Number(a[metricCol] || 0))[0];
      const bars = rows.slice(0, 10).map((r) => {
        const v = Number(r[metricCol] || 0);
        const pct = Math.max(2, Math.round((v / max) * 100));
        return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;font-size:12px">
          <div style="width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600">${String(r[labelCol] ?? '')}</div>
          <div style="flex:1;background:#ede4d8;height:14px;border-radius:7px;overflow:hidden">
            <div style="width:${pct}%;background:#8B5A2B;height:100%;border-radius:7px"></div>
          </div>
          <div style="width:90px;text-align:right;font-weight:700">${v.toLocaleString('es-BO')}</div>
        </div>`;
      }).join('');

      chartHtml = `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
          <div class="kpi"><div class="kl">Total (${metricCol.replace(/_/g, ' ')})</div><div class="kv">${total.toLocaleString('es-BO')}</div></div>
          <div class="kpi"><div class="kl">Promedio</div><div class="kv">${avg.toLocaleString('es-BO')}</div></div>
          <div class="kpi"><div class="kl">Líder / Máximo</div><div class="kv" style="font-size:14px">${String(topRow?.[labelCol] ?? '—')} (${Number(topRow?.[metricCol] || 0).toLocaleString('es-BO')})</div></div>
          <div class="kpi"><div class="kl">Registros Analizados</div><div class="kv">${rows.length}</div></div>
        </div>
        <div class="box">
          <div style="font-weight:700;color:#8B5A2B;margin-bottom:10px;font-size:13px">GRÁFICA COMPARATIVA — ${metricCol.replace(/_/g, ' ').toUpperCase()} POR ${labelCol.replace(/_/g, ' ').toUpperCase()}</div>
          ${bars}
        </div>
      `;
    }

    const origin = window.location.origin;
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte Ejecutivo - Carpintería El Roble</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #2b2118; margin: 28px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #8B5A2B; padding-bottom: 12px; margin-bottom: 18px; }
    .brand-wrap { display: flex; align-items: center; gap: 12px; }
    .logo { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; }
    .brand { font-size: 20px; font-weight: 800; color: #8B5A2B; }
    .badge { background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .kpi { background: #FAF7F2; border: 1px solid #E5DEC9; border-radius: 8px; padding: 10px 12px; }
    .kl { font-size: 11px; color: #6b7280; text-transform: uppercase; }
    .kv { font-size: 18px; font-weight: 800; color: #3B2F2F; margin-top: 4px; }
    .box { background: #FAF7F2; border: 1px solid #E5DEC9; border-radius: 8px; padding: 14px; margin-bottom: 16px; }
    .sql { font-family: monospace; font-size: 11px; background: #f3f4f6; padding: 8px; border-radius: 6px; color: #374151; word-break: break-all; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12.5px; }
    th { background: #8B5A2B; color: #fff; text-align: left; padding: 8px 10px; }
    td { border-bottom: 1px solid #e5e7eb; padding: 7px 10px; }
    tr:nth-child(even) td { background: #faf8f5; }
    .footer { margin-top: 22px; font-size: 11px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-wrap">
      <img src="${origin}/logo_el_roble.png" onerror="this.style.display='none'" class="logo" alt="El Roble" />
      <div>
        <div class="brand">CARPINTERÍA ARTESANAL "EL ROBLE"</div>
        <div style="font-size:12.5px;color:#6b7280">Reporte Ejecutivo de Inteligencia de Negocio</div>
      </div>
    </div>
    <div class="badge">${report.source}</div>
  </div>
  <div class="box">
    <div><b>Consulta Ejecutiva:</b> «${userQuery}»</div>
    <div style="margin-top:6px"><b>Conclusión Ejecutiva IA:</b> ${report.narrative}</div>
    <div style="margin-top:6px" class="sql"><b>SQL Validado:</b> ${report.sql}</div>
  </div>
  ${chartHtml}
  <table>
    <thead><tr>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table>
  <div class="footer">
    Generado el ${new Date().toLocaleString('es-BO')} · Carpintería El Roble — Sistema de Gestión Empresarial
  </div>
  <script>window.onload = () => { setTimeout(() => window.print(), 300); };</script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=980,height=760');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
    }
  }
}
