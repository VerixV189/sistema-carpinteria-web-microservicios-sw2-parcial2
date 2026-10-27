import { Inject, Injectable } from '@nestjs/common';
import { Payment } from '../../../domain/payment/entities/payment.entity';
import { PaymentId } from '../../../domain/payment/value-objects/payment-id.vo';
import { TransactionLog } from '../../../domain/payment/value-objects/transaction-log.vo';
import { PAYMENT_LOG_REPOSITORY, PaymentLogRepository } from '../../../domain/payment/repositories/payment-log.repository';
import { PAYMENT_GATEWAY, PaymentGatewayPort } from '../ports/payment-gateway.port';
import { RabbitMQAdapter } from '../../../infrastructure/adapters/outbound/messaging/rabbitmq.adapter';
import { PaymentCompletedEvent } from '../../../domain/payment/events/payment-completed.event';
import { ProcessPaymentCommand } from './process-payment.command';

@Injectable()
export class ProcessPaymentHandler {
  constructor(
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGatewayPort,
    @Inject(PAYMENT_LOG_REPOSITORY) private readonly repository: PaymentLogRepository,
    private readonly events: RabbitMQAdapter,
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<Payment> {
    const payment = new Payment(
      PaymentId.new(),
      command.quotationId,
      command.amount,
      command.currency ?? 'BOB',
    );
    payment.cardLast4 = command.cardNumber.slice(-4);

    // Log INITIATED → DynamoDB
    await this.repository.append(
      new TransactionLog(payment.id.value, 'INITIATED', {
        quotationId: command.quotationId,
        amount: command.amount,
      }),
    );

    const result = await this.gateway.charge({
      amount: command.amount,
      currency: payment.currency,
      cardNumber: command.cardNumber,
      cardHolder: command.cardHolder,
      expiryMonth: command.expiryMonth,
      expiryYear: command.expiryYear,
      cvv: command.cvv,
      reference: payment.id.value,
    });

    if (result.approved) {
      payment.complete(result.transactionId!);
      await this.repository.append(
        new TransactionLog(payment.id.value, 'APPROVED', { transactionId: result.transactionId }),
      );
    } else {
      payment.fail();
      await this.repository.append(
        new TransactionLog(payment.id.value, 'DECLINED', { reason: result.error }),
      );
    }

    const saved = await this.repository.savePayment(payment);

    // payment.completed → n8n + Laravel (recibo) + Spring Boot (estado pedido)
    if (saved.status === 'COMPLETED') {
      const event: PaymentCompletedEvent = {
        paymentId: saved.id.value,
        quotationId: saved.quotationId,
        orderId: command.orderId,
        clientId: command.clientId,
        // En este dominio clientId porta el email del cliente → billing lo guarda
        clientEmail: command.clientId,
        amount: saved.amount,
        currency: saved.currency,
        gatewayTransactionId: saved.gatewayTransactionId,
        occurredAt: new Date().toISOString(),
      };
      await this.events.publish('payment.completed', event);
    }

    return saved;
  }
}
