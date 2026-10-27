import { Quotation } from '../entities/quotation.entity';

export const QUOTATION_REPOSITORY = Symbol('QUOTATION_REPOSITORY');

/** Port OUT — persistencia de cotizaciones (MongoDB). */
export interface QuotationRepository {
  findAll(clientId?: string): Promise<Quotation[]>;
  findById(id: string): Promise<Quotation | null>;
  save(quotation: Quotation): Promise<Quotation>;
}
