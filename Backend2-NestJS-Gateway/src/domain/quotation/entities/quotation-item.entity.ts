import { FurnitureSpecs } from '../value-objects/furniture-specs.vo';

/** Entidad interna del agregado Quotation. */
export class QuotationItem {
  constructor(
    public readonly description: string,
    public readonly specs: FurnitureSpecs,
    public readonly quantity: number,
    public readonly unitPrice: number,
  ) {
    if (quantity <= 0) throw new Error('quantity debe ser positiva');
    if (unitPrice < 0) throw new Error('unitPrice no puede ser negativo');
  }

  subtotal(): number {
    return this.quantity * this.unitPrice;
  }
}
