import { QuotationItem } from './quotation-item.entity';
import { QuotationId } from '../value-objects/quotation-id.vo';

export type QuotationStatus = 'DRAFT' | 'QUOTED' | 'APPROVED' | 'REJECTED' | 'CONVERTED';

/** Modalidad de entrega elegida por el cliente. */
export interface DeliveryPreference {
  type: 'PICKUP' | 'DELIVERY';
  address?: string;
  lat?: number;
  lng?: number;
}

/** Aggregate Root — Cotización (CU3).
 *
 * Flujo comercial real: el cliente solicita (DRAFT, con estimado IA) → el
 * taller fija el precio formal y se lo envía (QUOTED + finalAmount) → el
 * CLIENTE decide: acepta (APPROVED → se crea el pedido), contraoferta
 * (vuelve a DRAFT con clientMessage/counterAmount) o rechaza (REJECTED).
 * CONVERTED cuando el pedido ya se generó. */
export class Quotation {
  constructor(
    public readonly id: QuotationId,
    public clientId: string,
    public items: QuotationItem[] = [],
    public status: QuotationStatus = 'DRAFT',
    public photoUrl?: string,
    public aiEstimate?: { furnitureType: string; confidence: number; estimatedPrice: number },
    public totalAmount = 0,
    public readonly createdAt = new Date(),
    public updatedAt = new Date(),
    public delivery?: DeliveryPreference,
    public finalAmount?: number,
    public clientMessage?: string,
    public counterAmount?: number,
  ) {}

  static create(clientId: string, items: QuotationItem[], photoUrl?: string): Quotation {
    const q = new Quotation(QuotationId.new(), clientId, items);
    q.photoUrl = photoUrl;
    q.recalculate();
    return q;
  }

  recalculate(): void {
    this.totalAmount = this.items.reduce((sum, i) => sum + i.subtotal(), 0);
    this.updatedAt = new Date();
  }

  applyAiEstimate(estimate: { furnitureType: string; confidence: number; estimatedPrice: number }): void {
    this.aiEstimate = estimate;
    if (this.totalAmount === 0) {
      this.totalAmount = estimate.estimatedPrice;
    }
    this.status = 'DRAFT'; // estimado referencial — falta precio formal del taller
    this.updatedAt = new Date();
  }

  /** El taller envía el precio formal al cliente (puede diferir del estimado). */
  sendQuote(amount?: number): void {
    this.finalAmount = amount ?? this.totalAmount;
    this.status = 'QUOTED';
    this.clientMessage = undefined;
    this.updatedAt = new Date();
  }

  /** El cliente acepta el precio formal → acuerdo cerrado. */
  clientAccept(): void {
    if (this.status === 'APPROVED') return;
    this.status = 'APPROVED';
    this.updatedAt = new Date();
  }

  /** El cliente pide otro precio: vuelve a revisión del taller. */
  clientCounter(message: string, counterAmount?: number): void {
    this.status = 'DRAFT';
    this.clientMessage = message;
    this.counterAmount = counterAmount;
    this.finalAmount = undefined;
    this.updatedAt = new Date();
  }

  approve(): void {
    if (this.status === 'APPROVED') return;
    this.status = 'APPROVED';
    this.updatedAt = new Date();
  }

  reject(): void {
    this.status = 'REJECTED';
    this.updatedAt = new Date();
  }

  convert(): void {
    this.status = 'CONVERTED';
    this.updatedAt = new Date();
  }

  /** Precio que paga el cliente: el formal del taller si existe. */
  payableAmount(): number {
    return this.finalAmount ?? this.totalAmount;
  }
}
