import { PaymentId } from '../value-objects/payment-id.vo';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

/** Aggregate Root — Pago (CU6). */
export class Payment {
  constructor(
    public readonly id: PaymentId,
    public readonly quotationId: string,
    public readonly amount: number,
    public readonly currency: string = 'BOB',
    public status: PaymentStatus = 'PENDING',
    public gatewayTransactionId?: string,
    public cardLast4?: string,
    public readonly createdAt = new Date(),
  ) {}

  complete(gatewayTransactionId: string): void {
    this.status = 'COMPLETED';
    this.gatewayTransactionId = gatewayTransactionId;
  }

  fail(): void {
    this.status = 'FAILED';
  }
}
