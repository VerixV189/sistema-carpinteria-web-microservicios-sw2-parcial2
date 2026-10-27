/** Evento de dominio — cotización creada/aprobada. */
export interface QuotationCreatedEvent {
  quotationId: string;
  clientId: string;
  totalAmount: number;
  occurredAt: string;
}

export interface QuotationApprovedEvent {
  quotationId: string;
  orderId?: number;
  clientId: string;
  totalAmount: number;
  occurredAt: string;
}
