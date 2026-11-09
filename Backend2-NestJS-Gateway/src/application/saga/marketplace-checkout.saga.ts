import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  MarketplaceProduct,
  MongoProductRepository,
} from '../../infrastructure/adapters/outbound/persistence/mongo-product.repository';
import { ProcessPaymentHandler } from '../payment/commands/process-payment.handler';
import { RabbitMQAdapter } from '../../infrastructure/adapters/outbound/messaging/rabbitmq.adapter';
import {
  PAYMENT_LOG_REPOSITORY,
  PaymentLogRepository,
} from '../../domain/payment/repositories/payment-log.repository';
import { TransactionLog } from '../../domain/payment/value-objects/transaction-log.vo';

export interface SagaStepRecord {
  step: 'RESERVE_STOCK' | 'PROCESS_PAYMENT' | 'DISPATCH_PRODUCTION_ORDER';
  status: 'COMPLETED' | 'FAILED' | 'COMPENSATED';
  detail: string;
  timestamp: string;
}

export interface SagaExecutionLog {
  sagaId: string;
  marketplaceRef: string;
  clientEmail: string;
  totalAmount: number;
  status: 'RUNNING' | 'COMPLETED' | 'COMPENSATED' | 'FAILED';
  steps: SagaStepRecord[];
  compensations: string[];
  startedAt: string;
  finishedAt?: string;
}

export interface ExecuteCheckoutSagaCommand {
  clientEmail: string;
  items: Array<{ productId: string; quantity: number }>;
  deliveryType: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  notes?: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}

function mapCategoryToFurnitureType(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('mesa')) return 'TABLE';
  if (c.includes('silla')) return 'CHAIR';
  if (c.includes('ropero')) return 'WARDROBE';
  if (c.includes('puerta')) return 'DOOR';
  if (c.includes('cocina')) return 'KITCHEN';
  if (c.includes('escritorio')) return 'DESK';
  if (c.includes('cama')) return 'BED';
  return 'OTHER';
}

/**
 * PATRÓN DE DISEÑO SAGA (Saga Basada en Orquestación + Transacciones de Compensación)
 *
 * Coordina una transacción distribuida transversal que abarca múltiples bases de datos
 * y microservicios heterogéneos:
 *   - Paso 1 (Local / MongoDB): Reserva y descuento atómico de stock en el catálogo Marketplace.
 *   - Paso 2 (Pasarela / DynamoDB / RabbitMQ → PHP): Cobro con tarjeta y registro de auditoría.
 *   - Paso 3 (RabbitMQ → Java Spring Boot / PostgreSQL): Emisión de orden de producción pagada.
 *
 * Si cualquier paso intermedio o posterior falla, el Orquestador ejecuta las
 * Transacciones de Compensación en orden inverso (LIFO) para restaurar la consistencia eventual.
 */
@Injectable()
export class MarketplaceCheckoutSaga {
  private readonly log = new Logger(MarketplaceCheckoutSaga.name);
  private readonly history: SagaExecutionLog[] = [];

  constructor(
    private readonly productRepo: MongoProductRepository,
    private readonly processPayment: ProcessPaymentHandler,
    private readonly events: RabbitMQAdapter,
    @Inject(PAYMENT_LOG_REPOSITORY)
    private readonly paymentLogs: PaymentLogRepository,
  ) {}

  getRecentExecutions(): SagaExecutionLog[] {
    return this.history.slice(0, 50);
  }

  async execute(cmd: ExecuteCheckoutSagaCommand) {
    const sagaId = `SAGA-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const marketplaceRef = `MKT-${Date.now()}`;
    const execution: SagaExecutionLog = {
      sagaId,
      marketplaceRef,
      clientEmail: cmd.clientEmail,
      totalAmount: 0,
      status: 'RUNNING',
      steps: [],
      compensations: [],
      startedAt: new Date().toISOString(),
    };
    this.history.unshift(execution);

    // Lista de acciones compensatorias registradas conforme avanzan los pasos (LIFO)
    const compensationStack: Array<() => Promise<void>> = [];
    const reservedItems: Array<{
      product: MarketplaceProduct;
      quantity: number;
      previousStock: number;
    }> = [];

    try {
      // =========================================================================
      // PASO 1 DE LA SAGA: Validar y Reservar Stock en MongoDB
      // =========================================================================
      let totalAmount = 0;
      for (const item of cmd.items) {
        const prod = await this.productRepo.findById(item.productId);
        if (!prod) {
          throw new NotFoundException(`El mueble ${item.productId} ya no existe`);
        }
        if (prod.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${prod.name}" (disponibles: ${prod.stock})`,
          );
        }
        reservedItems.push({
          product: prod,
          quantity: item.quantity,
          previousStock: prod.stock,
        });
        totalAmount += prod.price * item.quantity;
      }
      execution.totalAmount = totalAmount;

      for (const entry of reservedItems) {
        entry.product.stock = Math.max(0, entry.product.stock - entry.quantity);
        await this.productRepo.save(entry.product);
      }

      execution.steps.push({
        step: 'RESERVE_STOCK',
        status: 'COMPLETED',
        detail: `Stock reservado en MongoDB para ${reservedItems.length} ítem(s) por Bs. ${totalAmount.toFixed(2)}`,
        timestamp: new Date().toISOString(),
      });

      // Registrar Transacción de Compensación #1: Restaurar Stock en MongoDB
      compensationStack.push(async () => {
        for (const entry of reservedItems) {
          const current = await this.productRepo.findById(entry.product.id);
          if (current) {
            current.stock = entry.previousStock;
            await this.productRepo.save(current);
          }
        }
        const msg = `Compensación RESERVE_STOCK: Stock restaurado en MongoDB para ${reservedItems.map((r) => `${r.product.name} (-> ${r.previousStock})`).join(', ')}`;
        this.log.warn(`[${sagaId}] ${msg}`);
        execution.compensations.push(msg);
        const step = execution.steps.find((s) => s.step === 'RESERVE_STOCK');
        if (step) step.status = 'COMPENSATED';
      });

      // =========================================================================
      // PASO 2 DE LA SAGA: Procesar Cobro (Stripe + DynamoDB + Evento Facturación)
      // =========================================================================
      if (cmd.notes?.includes('[SAGA_FAIL_PAYMENT]')) {
        throw new BadRequestException('Fallo simulado en pasarela de pagos para demostrar compensación Saga');
      }

      const payment = await this.processPayment.execute({
        quotationId: marketplaceRef,
        clientId: cmd.clientEmail,
        amount: totalAmount,
        currency: 'BOB',
        cardNumber: cmd.cardNumber,
        cardHolder: cmd.cardHolder,
        expiryMonth: cmd.expiryMonth,
        expiryYear: cmd.expiryYear,
        cvv: cmd.cvv,
      });

      if (payment.status !== 'COMPLETED') {
        throw new BadRequestException('El pago fue rechazado por la pasarela');
      }

      execution.steps.push({
        step: 'PROCESS_PAYMENT',
        status: 'COMPLETED',
        detail: `Pago ${payment.id.value} aprobado y auditado en DynamoDB`,
        timestamp: new Date().toISOString(),
      });

      // Registrar Transacción de Compensación #2: Anular/Reembolsar Pago en DynamoDB
      compensationStack.push(async () => {
        await this.paymentLogs.append(
          new TransactionLog(payment.id.value, 'SAGA_COMPENSATED_REFUND', {
            sagaId,
            quotationId: marketplaceRef,
            clientId: cmd.clientEmail,
            refundedAmount: -totalAmount,
            currency: 'BOB',
            reason: 'Rollback de transacción distribuida Saga',
          }),
        );
        const msg = `Compensación PROCESS_PAYMENT: Reembolso/Anulación registrado en DynamoDB para pago ${payment.id.value}`;
        this.log.warn(`[${sagaId}] ${msg}`);
        execution.compensations.push(msg);
        const step = execution.steps.find((s) => s.step === 'PROCESS_PAYMENT');
        if (step) step.status = 'COMPENSATED';
      });

      // =========================================================================
      // PASO 3 DE LA SAGA: Despachar Eventos de Orden de Producción y Stock Bajo
      // =========================================================================
      if (cmd.notes?.includes('[SAGA_FAIL_ORDER]')) {
        throw new BadRequestException('Fallo simulado al despachar orden para demostrar compensación de Pago + Stock');
      }

      for (const entry of reservedItems) {
        if (entry.product.stock <= 2) {
          await this.events.publish('material.low_stock', {
            materialName: `${entry.product.name} (${entry.product.woodType})`,
            stock: entry.product.stock,
            minStock: 3,
          });
        }
      }

      const carpenterEmail = reservedItems.find((e) => e.product.carpenterEmail)?.product
        .carpenterEmail;

      const summaryDescription = reservedItems
        .map((e) => `${e.product.name} (x${e.quantity})`)
        .join(', ');

      await this.events.publish('quotation.approved', {
        quotationId: marketplaceRef,
        clientId: cmd.clientEmail,
        totalAmount,
        paid: true,
        sagaId,
        carpenterEmail: carpenterEmail ?? null,
        description: `Compra Marketplace: ${summaryDescription}${cmd.notes ? ` — ${cmd.notes}` : ''}`,
        items: reservedItems.map((e) => ({
          description: `${e.product.name} (${e.product.dimensions})`,
          furnitureType: mapCategoryToFurnitureType(e.product.category),
          woodType: e.product.woodType.toUpperCase(),
          quantity: e.quantity,
          unitPrice: e.product.price,
          dimensions: { lengthM: 1.5, widthM: 0.8, heightM: 0.8 },
        })),
        delivery: {
          type: cmd.deliveryType,
          address:
            cmd.deliveryType === 'DELIVERY'
              ? cmd.deliveryAddress || 'Envío a domicilio'
              : 'Recojo en taller',
          lat: cmd.deliveryLat,
          lng: cmd.deliveryLng,
        },
        occurredAt: new Date().toISOString(),
      });

      execution.steps.push({
        step: 'DISPATCH_PRODUCTION_ORDER',
        status: 'COMPLETED',
        detail: `Evento quotation.approved emitido a RabbitMQ para creación de pedido en PostgreSQL`,
        timestamp: new Date().toISOString(),
      });

      execution.status = 'COMPLETED';
      execution.finishedAt = new Date().toISOString();
      this.log.log(`[${sagaId}] Saga completada exitosamente (${marketplaceRef})`);

      return {
        sagaId,
        sagaStatus: execution.status,
        status: payment.status,
        paymentId: payment.id.value,
        marketplaceRef,
        totalAmount,
        carpenterEmail: carpenterEmail ?? null,
        items: reservedItems.map((e) => ({
          productId: e.product.id,
          name: e.product.name,
          quantity: e.quantity,
          unitPrice: e.product.price,
          remainingStock: e.product.stock,
        })),
      };
    } catch (error) {
      this.log.error(`[${sagaId}] Error en Saga: ${(error as Error).message}. Ejecutando compensaciones LIFO...`);

      // Ejecutar transacciones de compensación en orden inverso (LIFO)
      while (compensationStack.length > 0) {
        const compensate = compensationStack.pop()!;
        try {
          await compensate();
        } catch (compErr) {
          this.log.error(`[${sagaId}] Error ejecutando compensación: ${(compErr as Error).message}`);
        }
      }

      execution.status = execution.compensations.length > 0 ? 'COMPENSATED' : 'FAILED';
      execution.finishedAt = new Date().toISOString();
      throw error;
    }
  }
}
