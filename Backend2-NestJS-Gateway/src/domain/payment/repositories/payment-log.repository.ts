import { TransactionLog } from '../value-objects/transaction-log.vo';
import { Payment } from '../entities/payment.entity';

export const PAYMENT_LOG_REPOSITORY = Symbol('PAYMENT_LOG_REPOSITORY');

/** Port OUT — log de transacciones (DynamoDB) + estado de pagos (MongoDB). */
export interface PaymentLogRepository {
  append(log: TransactionLog): Promise<void>;
  logsOf(paymentId: string): Promise<TransactionLog[]>;
  savePayment(payment: Payment): Promise<Payment>;
  findPayment(id: string): Promise<Payment | null>;
}
