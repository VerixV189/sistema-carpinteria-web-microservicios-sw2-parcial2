/** Evento de dominio — pago completado → dispara recibo (CU5). */
export interface PaymentCompletedEvent {
  paymentId: string;
  quotationId: string;
  orderId?: number;
  clientId: string;
  clientEmail?: string;
  amount: number;
  currency: string;
  gatewayTransactionId?: string;
  occurredAt: string;
}
