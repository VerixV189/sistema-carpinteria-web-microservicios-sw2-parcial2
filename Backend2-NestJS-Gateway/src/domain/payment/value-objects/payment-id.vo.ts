import { randomUUID } from 'crypto';

export class PaymentId {
  private constructor(public readonly value: string) {}

  static new(): PaymentId {
    return new PaymentId(`pay-${randomUUID()}`);
  }

  static of(value: string): PaymentId {
    return new PaymentId(value);
  }

  toString(): string {
    return this.value;
  }
}
