import { Inject, Injectable } from '@nestjs/common';
import { Quotation } from '../../../domain/quotation/entities/quotation.entity';
import { QuotationItem } from '../../../domain/quotation/entities/quotation-item.entity';
import { FurnitureSpecs } from '../../../domain/quotation/value-objects/furniture-specs.vo';
import { QUOTATION_REPOSITORY, QuotationRepository } from '../../../domain/quotation/repositories/quotation.repository';
import { AiServiceAdapter } from '../../../infrastructure/adapters/outbound/external/ai-service.adapter';
import { RabbitMQAdapter } from '../../../infrastructure/adapters/outbound/messaging/rabbitmq.adapter';
import { CreateQuotationCommand } from './create-quotation.command';

@Injectable()
export class CreateQuotationHandler {
  constructor(
    @Inject(QUOTATION_REPOSITORY) private readonly repository: QuotationRepository,
    private readonly ai: AiServiceAdapter,
    private readonly events: RabbitMQAdapter,
  ) {}

  async execute(command: CreateQuotationCommand): Promise<Quotation> {
    const items = command.items.map(
      (i) =>
        new QuotationItem(
          i.description,
          new FurnitureSpecs(i.furnitureType, i.woodType, i.dimensions, i.finish),
          i.quantity,
          i.unitPrice,
        ),
    );
    const quotation = Quotation.create(command.clientId, items, command.photoUrl);

    // CU3: si no hay precio, pedir estimación a la IA
    if (command.requestEstimate || quotation.totalAmount === 0) {
      const estimate = await this.ai.estimateQuotation({
        description: items[0]?.description,
        furnitureType: items[0]?.specs.furnitureType,
        woodType: items[0]?.specs.woodType,
        dimensions: items[0]?.specs.dimensions,
      });
      if (estimate) {
        quotation.applyAiEstimate({
          furnitureType: estimate.furnitureType,
          confidence: estimate.confidence,
          estimatedPrice: estimate.estimatedPrice,
        });
      }
    }

    const saved = await this.repository.save(quotation);
    await this.events.publish('quotation.created', {
      quotationId: saved.id.value,
      clientId: saved.clientId,
      totalAmount: saved.totalAmount,
      occurredAt: new Date().toISOString(),
    });
    return saved;
  }
}
