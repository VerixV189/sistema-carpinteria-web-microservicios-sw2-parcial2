export interface ProcessPaymentCommand {
  quotationId: string;
  orderId?: number;
  clientId: string;
  amount: number;
  currency?: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}
