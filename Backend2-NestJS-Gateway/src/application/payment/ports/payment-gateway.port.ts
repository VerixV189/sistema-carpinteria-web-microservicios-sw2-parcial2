export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface ChargeRequest {
  amount: number;
  currency: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  reference: string;
}

export interface ChargeResult {
  approved: boolean;
  transactionId?: string;
  error?: string;
}

/** Port OUT — pasarela de pago (Stripe / Mercado Pago / mock). */
export interface PaymentGatewayPort {
  charge(request: ChargeRequest): Promise<ChargeResult>;
}
