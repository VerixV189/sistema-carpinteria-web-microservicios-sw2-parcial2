import { Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Quotation } from '../../../../domain/quotation/entities/quotation.entity';
import { QuotationItem } from '../../../../domain/quotation/entities/quotation-item.entity';
import { QuotationId } from '../../../../domain/quotation/value-objects/quotation-id.vo';
import { FurnitureSpecs } from '../../../../domain/quotation/value-objects/furniture-specs.vo';
import { QuotationRepository } from '../../../../domain/quotation/repositories/quotation.repository';
import { MongodbConfig } from '../../../../config/mongodb.config';

/** Adaptador OUT — QuotationRepository sobre MongoDB (documentos flexibles). */
@Injectable()
export class MongoQuotationRepository implements QuotationRepository, OnModuleInit {
  private model!: Model<Record<string, unknown>>;

  constructor(private readonly mongo: MongodbConfig) {}

  onModuleInit(): void {
    this.model = this.mongo.quotationsModel();
  }

  private toDomain(doc: Record<string, unknown>): Quotation {
    const items = ((doc.items as Record<string, unknown>[]) ?? []).map(
      (i) =>
        new QuotationItem(
          i.description as string,
          new FurnitureSpecs(
            i.furnitureType as string,
            i.woodType as string,
            i.dimensions as { lengthM: number; widthM: number; heightM: number },
            i.finish as string,
          ),
          i.quantity as number,
          i.unitPrice as number,
        ),
    );
    const q = new Quotation(
      QuotationId.of(doc._id as string),
      doc.clientId as string,
      items,
      doc.status as Quotation['status'],
      doc.photoUrl as string | undefined,
      doc.aiEstimate as Quotation['aiEstimate'],
      doc.totalAmount as number,
      doc.createdAt as Date,
      doc.updatedAt as Date,
      doc.delivery as Quotation['delivery'],
      doc.finalAmount as number | undefined,
      doc.clientMessage as string | undefined,
      doc.counterAmount as number | undefined,
    );
    return q;
  }

  private toDoc(q: Quotation): Record<string, unknown> {
    return {
      _id: q.id.value,
      clientId: q.clientId,
      status: q.status,
      photoUrl: q.photoUrl,
      aiEstimate: q.aiEstimate,
      totalAmount: q.totalAmount,
      finalAmount: q.finalAmount,
      delivery: q.delivery,
      clientMessage: q.clientMessage,
      counterAmount: q.counterAmount,
      items: q.items.map((i) => ({
        description: i.description,
        furnitureType: i.specs.furnitureType,
        woodType: i.specs.woodType,
        dimensions: i.specs.dimensions,
        finish: i.specs.finish,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal(),
      })),
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    };
  }

  async findAll(clientId?: string): Promise<Quotation[]> {
    const docs = await this.model.find(clientId ? { clientId } : {}).sort({ createdAt: -1 }).lean();
    return docs.map((d) => this.toDomain(d as Record<string, unknown>));
  }

  async findById(id: string): Promise<Quotation | null> {
    const doc = await this.model.findById(id).lean();
    return doc ? this.toDomain(doc as Record<string, unknown>) : null;
  }

  async save(quotation: Quotation): Promise<Quotation> {
    const doc = this.toDoc(quotation);
    await this.model.updateOne({ _id: quotation.id.value }, { $set: doc }, { upsert: true });
    return quotation;
  }
}
