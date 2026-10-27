import { randomUUID } from 'crypto';

/** Value Object — identidad de la cotización. */
export class QuotationId {
  private constructor(public readonly value: string) {}

  static new(): QuotationId {
    return new QuotationId(`quo-${randomUUID()}`);
  }

  static of(value: string): QuotationId {
    return new QuotationId(value);
  }

  toString(): string {
    return this.value;
  }
}
