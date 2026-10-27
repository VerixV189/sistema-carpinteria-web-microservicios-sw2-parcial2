import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/** Redis: sesiones de usuario y cache de rate-limit/sesión. */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const url = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
    this.client
      .connect()
      .then(() => this.logger.log('Redis conectado'))
      .catch((err) => {
        this.logger.warn(`Redis no disponible (${err.message}) — operando en memoria`);
        this.client = null;
      });
  }

  getClient(): Redis | null {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }
}
