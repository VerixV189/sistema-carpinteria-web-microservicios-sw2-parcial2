import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// — API Gateway (auth, cache, eventos → websocket, proxy) —
import { AuthModule } from './auth/auth.module';
import { MessagingModule } from './messaging/messaging.module';
import { WebsocketModule } from './websocket/websocket.module';
import { RedisModule } from './cache/redis.module';
import { HealthController } from './health.controller';

// — Dominio propio: Cotizaciones (CU3) + Pagos (CU6) —
import { QuotationController } from './infrastructure/adapters/inbound/rest/quotation.controller';
import { PaymentController } from './infrastructure/adapters/inbound/rest/payment.controller';
import { UploadsController } from './infrastructure/adapters/inbound/rest/uploads.controller';
import { ProductController } from './infrastructure/adapters/inbound/rest/product.controller';
import { CreateQuotationHandler } from './application/quotation/commands/create-quotation.handler';
import { GetQuotationHandler } from './application/quotation/queries/get-quotation.handler';
import { ProcessPaymentHandler } from './application/payment/commands/process-payment.handler';
import { QUOTATION_REPOSITORY } from './domain/quotation/repositories/quotation.repository';
import { PAYMENT_LOG_REPOSITORY } from './domain/payment/repositories/payment-log.repository';
import { PAYMENT_GATEWAY } from './application/payment/ports/payment-gateway.port';
import { MongoQuotationRepository } from './infrastructure/adapters/outbound/persistence/mongo-quotation.repository';
import { MongoProductRepository } from './infrastructure/adapters/outbound/persistence/mongo-product.repository';
import { DynamoDBPaymentLogRepository } from './infrastructure/adapters/outbound/persistence/dynamodb-payment-log.repository';
import { StripeAdapter } from './infrastructure/adapters/outbound/external/stripe.adapter';
import { AiServiceAdapter } from './infrastructure/adapters/outbound/external/ai-service.adapter';
import { RabbitMQAdapter } from './infrastructure/adapters/outbound/messaging/rabbitmq.adapter';
import { MongodbConfig } from './config/mongodb.config';
import { DynamodbConfig } from './config/dynamodb.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting global: 120 req/min por IP
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    RedisModule,
    AuthModule,
    MessagingModule,
    WebsocketModule,
  ],
  controllers: [
    HealthController,
    QuotationController,
    PaymentController,
    UploadsController,
    ProductController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    MongodbConfig,
    DynamodbConfig,
    RabbitMQAdapter,
    AiServiceAdapter,
    CreateQuotationHandler,
    GetQuotationHandler,
    ProcessPaymentHandler,
    MongoProductRepository,
    { provide: QUOTATION_REPOSITORY, useClass: MongoQuotationRepository },
    { provide: PAYMENT_LOG_REPOSITORY, useClass: DynamoDBPaymentLogRepository },
    { provide: PAYMENT_GATEWAY, useClass: StripeAdapter },
  ],
})
export class AppModule {}
