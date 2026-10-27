import { Test } from '@nestjs/testing';
import { ProcessPaymentHandler } from './process-payment.handler';
import { PAYMENT_GATEWAY } from '../ports/payment-gateway.port';
import { PAYMENT_LOG_REPOSITORY } from '../../../domain/payment/repositories/payment-log.repository';
import { RabbitMQAdapter } from '../../../infrastructure/adapters/outbound/messaging/rabbitmq.adapter';
import { Payment } from '../../../domain/payment/entities/payment.entity';

describe('ProcessPaymentHandler', () => {
  let handler: ProcessPaymentHandler;
  const published: { key: string; payload: unknown }[] = [];
  const saved: Payment[] = [];
  const logs: unknown[] = [];

  beforeEach(async () => {
    published.length = 0;
    saved.length = 0;
    const module = await Test.createTestingModule({
      providers: [
        ProcessPaymentHandler,
        {
          provide: PAYMENT_GATEWAY,
          useValue: {
            charge: async ({ cardNumber }: { cardNumber: string }) =>
              cardNumber.startsWith('4242')
                ? { approved: true, transactionId: 'tx_1' }
                : { approved: false, error: 'declined' },
          },
        },
        {
          provide: PAYMENT_LOG_REPOSITORY,
          useValue: {
            append: async (l: unknown) => { logs.push(l); },
            logsOf: async () => [],
            savePayment: async (p: Payment) => { saved.push(p); return p; },
            findPayment: async (id: string) =>
              saved.find((p) => p.id.value === id) ?? null,
          },
        },
        {
          provide: RabbitMQAdapter,
          useValue: { publish: async (k: string, p: unknown) => { published.push({ key: k, payload: p }); } },
        },
      ],
    }).compile();
    handler = module.get(ProcessPaymentHandler);
  });

  it('pago aprobado publica payment.completed', async () => {
    const payment = await handler.execute({
      quotationId: 'quo-1',
      clientId: 'cli-1',
      amount: 500,
      cardNumber: '4242424242424242',
      cardHolder: 'Ana',
      expiryMonth: 12,
      expiryYear: 2030,
      cvv: '123',
    });
    expect(payment.status).toBe('COMPLETED');
    expect(published.some((e) => e.key === 'payment.completed')).toBe(true);
  });

  it('pago rechazado no publica evento', async () => {
    const payment = await handler.execute({
      quotationId: 'quo-1',
      clientId: 'cli-1',
      amount: 500,
      cardNumber: '4000000000000002',
      cardHolder: 'Ana',
      expiryMonth: 12,
      expiryYear: 2030,
      cvv: '123',
    });
    expect(payment.status).toBe('FAILED');
    expect(published.length).toBe(0);
  });
});
