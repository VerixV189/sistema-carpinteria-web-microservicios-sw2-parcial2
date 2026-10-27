/** Value Object — entrada de log de transacción (DynamoDB, write-heavy). */
export class TransactionLog {
  constructor(
    public readonly paymentId: string,
    public readonly event: 'INITIATED' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'WEBHOOK',
    public readonly detail: Record<string, unknown>,
    public readonly timestamp = new Date(),
  ) {}

  toItem(): Record<string, unknown> {
    return {
      payment_id: this.paymentId,
      timestamp: this.timestamp.getTime(),
      event: this.event,
      detail: JSON.stringify(this.detail),
      ttl: Math.floor(this.timestamp.getTime() / 1000) + 90 * 24 * 3600, // TTL 90 días
    };
  }
}
