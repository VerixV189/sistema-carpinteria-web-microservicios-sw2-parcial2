/** Etiquetas en español + formatos para toda la consola. */

export const ORDER_STATUS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  IN_PRODUCTION: 'En producción',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const DELIVERY_STATUS: Record<string, string> = {
  SCHEDULED: 'Programada',
  IN_TRANSIT: 'En tránsito',
  DELIVERED: 'Entregada',
  FAILED: 'Fallida',
  RESCHEDULED: 'Reprogramada',
};

export const STEP_STATUS: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
};

export const QUOTATION_STATUS: Record<string, string> = {
  DRAFT: 'Por revisar',
  QUOTED: 'Enviada al cliente',
  APPROVED: 'Aceptada por el cliente',
  REJECTED: 'Rechazada',
  CONVERTED: 'Convertida en pedido',
};

export const DELIVERY_TYPE: Record<string, string> = {
  PICKUP: 'Recoge en taller',
  DELIVERY: 'Envío a domicilio',
};

export function deliveryTypeLabel(s?: string | null): string { return DELIVERY_TYPE[s ?? ''] ?? 'Envío a domicilio'; }

export const TIME_SLOT: Record<string, string> = {
  MORNING: 'Mañana',
  AFTERNOON: 'Tarde',
  EVENING: 'Noche',
};

/** '2026-10-31' → '31/10/2026' (acepta ISO con hora). */
export function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

/** 8500 → '8.500' */
export function fmtMoney(n?: number | null): string {
  return (n ?? 0).toLocaleString('es-BO', { maximumFractionDigits: 0 });
}

export function orderLabel(s: string): string { return ORDER_STATUS[s] ?? s; }
export function deliveryLabel(s: string): string { return DELIVERY_STATUS[s] ?? s; }
export function stepLabel(s: string): string { return STEP_STATUS[s] ?? s; }
export function quotationLabel(s: string): string { return QUOTATION_STATUS[s] ?? s; }
export function slotLabel(s: string): string { return TIME_SLOT[s] ?? s; }
