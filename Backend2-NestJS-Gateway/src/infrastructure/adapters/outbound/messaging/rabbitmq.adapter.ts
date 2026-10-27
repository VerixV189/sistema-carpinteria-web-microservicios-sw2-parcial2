import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

/** Adaptador OUT — publica eventos de dominio en RabbitMQ (topic exchange). */
@Injectable()
export class RabbitMQAdapter implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(RabbitMQAdapter.name);
  private conn: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private connecting: Promise<void> | null = null;
  private exchange: string;
  private url: string;

  constructor(private readonly config: ConfigService) {
    this.exchange = config.get<string>('RABBITMQ_EXCHANGE', 'carpinteria.events');
    this.url = config.get<string>('RABBITMQ_URL', 'amqp://carpinteria:carpinteria@localhost:5672');
  }

  async onModuleInit(): Promise<void> {
    await this.ensureConnected();
  }

  /** Conecta bajo demanda y se auto-recupera si el broker se reinicia o aún no está listo. */
  private async ensureConnected(): Promise<void> {
    if (this.channel) return;
    if (!this.connecting) {
      this.connecting = (async () => {
        try {
          this.conn = await amqp.connect(this.url);
          this.conn.on('close', () => {
            this.channel = null;
            this.conn = null;
          });
          this.conn.on('error', () => undefined);
          this.channel = await this.conn.createChannel();
          this.channel.on('close', () => {
            this.channel = null;
          });
          this.channel.on('error', () => undefined);
          await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
          this.log.log('RabbitMQ conectado');
        } catch (err) {
          this.log.warn(`RabbitMQ no disponible: ${(err as Error).message}`);
          this.channel = null;
          this.conn = null;
        } finally {
          this.connecting = null;
        }
      })();
    }
    await this.connecting;
  }

  async publish(routingKey: string, payload: unknown): Promise<void> {
    await this.ensureConnected();
    const body = Buffer.from(JSON.stringify(payload));
    if (!this.channel) {
      this.log.warn(`[evento omitido ${routingKey}] ${JSON.stringify(payload)}`);
      return;
    }
    try {
      this.channel.publish(this.exchange, routingKey, body, { persistent: true });
      this.log.debug(`Evento ${routingKey} publicado`);
    } catch (err) {
      this.channel = null;
      this.log.warn(`[evento falló ${routingKey}] ${(err as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close().catch(() => undefined);
    await this.conn?.close().catch(() => undefined);
  }
}
