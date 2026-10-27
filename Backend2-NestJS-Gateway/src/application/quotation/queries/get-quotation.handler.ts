import { Inject, Injectable } from '@nestjs/common';
import { Quotation } from '../../../domain/quotation/entities/quotation.entity';
import { QUOTATION_REPOSITORY, QuotationRepository } from '../../../domain/quotation/repositories/quotation.repository';

@Injectable()
export class GetQuotationHandler {
  constructor(@Inject(QUOTATION_REPOSITORY) private readonly repository: QuotationRepository) {}

  all(clientId?: string): Promise<Quotation[]> {
    return this.repository.findAll(clientId);
  }

  byId(id: string): Promise<Quotation | null> {
    return this.repository.findById(id);
  }
}
