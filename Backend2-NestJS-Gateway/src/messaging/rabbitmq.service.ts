import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { EventEmitter } from 'events';

export const ORDER_STATUS_QUEUE = 'gateway.order_status_changed';

/**
 * Consumidor RabbitMQ del gateway:
 *  - order.status_changed → re-emite por WebSocket a frontends (doc §5.5).
 */
@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  readonly events = new EventEmitter();
  private conn: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private connecting: Promise<void> | null = null;
  private stopped = false;
  private url: string;
  private exchange: string;

  constructor(private readonly config: ConfigService) {
    this.url = config.get<string>('RABBITMQ_URL', 'amqp://carpinteria:carpinteria@localhost:5672');
    this.exchange = config.get<string>('RABBITMQ_EXCHANGE', 'carpinteria.events');
  }

  async onModuleInit(): Promise<void> {
    void this.ensureConnected();
  }

  /** Conecta con reintentos y se re-suscribe si el broker se reinicia. */
  private async ensureConnected(): Promise<void> {
    if (this.channel || this.stopped) return;
    if (this.connecting) return this.connecting;
    this.connecting = (async () => {
      try {
        this.conn = await amqp.connect(this.url);
        this.conn.on('close', () => {
          this.channel = null;
          this.conn = null;
          if (!this.stopped) setTimeout(() => void this.ensureConnected(), 5000);
        });
        this.conn.on('error', () => undefined);
        this.channel = await this.conn.createChannel();
        this.channel.on('close', () => {
          this.channel = null;
        });
        this.channel.on('error', () => undefined);
        await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
        const q = await this.channel.assertQueue(ORDER_STATUS_QUEUE, { durable: true });
        await this.channel.bindQueue(q.queue, this.exchange, 'order.status_changed');
        await this.channel.consume(q.queue, (msg) => {
          if (!msg) return;
          try {
            this.events.emit('order.status_changed', JSON.parse(msg.content.toString()));
          } catch {
            this.events.emit('order.status_changed', msg.content.toString());
          }
          this.channel?.ack(msg);
        });
        this.logger.log('RabbitMQ conectado — escuchando order.status_changed');
      } catch (err) {
        this.channel = null;
        this.conn = null;
        this.logger.warn(`RabbitMQ no disponible: ${(err as Error).message} — reintento en 10s`);
        if (!this.stopped) setTimeout(() => void this.ensureConnected(), 10000);
      } finally {
        this.connecting = null;
      }
    })();
    return this.connecting;
  }

  async onModuleDestroy(): Promise<void> {
    this.stopped = true;
    await this.channel?.close().catch(() => undefined);
    await this.conn?.close().catch(() => undefined);
  }
}
