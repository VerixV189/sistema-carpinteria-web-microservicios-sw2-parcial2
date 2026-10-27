import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import {
  CreateTableCommand,
  DescribeTableCommand,
  KeyType,
  ScalarAttributeType,
} from '@aws-sdk/client-dynamodb';
import { TransactionLog } from '../../../../domain/payment/value-objects/transaction-log.vo';
import { Payment } from '../../../../domain/payment/entities/payment.entity';
import { PaymentId } from '../../../../domain/payment/value-objects/payment-id.vo';
import { PaymentLogRepository } from '../../../../domain/payment/repositories/payment-log.repository';
import { DynamodbConfig } from '../../../../config/dynamodb.config';
import { MongodbConfig } from '../../../../config/mongodb.config';

const TABLE = process.env.DYNAMODB_TABLE_LOGS ?? 'payment_logs';

/**
 * Adaptador OUT — logs de transacciones en DynamoDB (write-heavy, TTL)
 * y estado del pago en MongoDB.
 */
@Injectable()
export class DynamoDBPaymentLogRepository implements PaymentLogRepository, OnModuleInit {
  private readonly log = new Logger(DynamoDBPaymentLogRepository.name);
  private paymentsModel!: Model<Record<string, unknown>>;

  constructor(
    private readonly dynamo: DynamodbConfig,
    private readonly mongo: MongodbConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    this.paymentsModel = this.mongo.paymentsModel();
    await this.ensureTable();
  }

  private async ensureTable(): Promise<void> {
    try {
      await this.dynamo.raw.send(new DescribeTableCommand({ TableName: TABLE }));
    } catch {
      this.log.log(`Creando tabla DynamoDB ${TABLE}`);
      await this.dynamo.raw.send(
        new CreateTableCommand({
          TableName: TABLE,
          AttributeDefinitions: [
            { AttributeName: 'payment_id', AttributeType: ScalarAttributeType.S },
            { AttributeName: 'timestamp', AttributeType: ScalarAttributeType.N },
          ],
          KeySchema: [
            { AttributeName: 'payment_id', KeyType: KeyType.HASH },
            { AttributeName: 'timestamp', KeyType: KeyType.RANGE },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        }),
      );
    }
  }

  async append(log: TransactionLog): Promise<void> {
    try {
      await this.dynamo.doc.send(new PutCommand({ TableName: TABLE, Item: log.toItem() }));
    } catch (err) {
      this.log.warn(`DynamoDB append falló (log en consola): ${(err as Error).message}`);
      this.log.log(JSON.stringify(log.toItem()));
    }
  }

  async logsOf(paymentId: string): Promise<TransactionLog[]> {
    try {
      const res = await this.dynamo.doc.send(
        new QueryCommand({
          TableName: TABLE,
          KeyConditionExpression: 'payment_id = :pid',
          ExpressionAttributeValues: { ':pid': paymentId },
        }),
      );
      return (res.Items ?? []).map(
        (i) =>
          new TransactionLog(
            i.payment_id as string,
            i.event as TransactionLog['event'],
            JSON.parse((i.detail as string) ?? '{}'),
            new Date(i.timestamp as number),
          ),
      );
    } catch {
      return [];
    }
  }

  // ---- estado de pago en MongoDB ----

  async savePayment(payment: Payment): Promise<Payment> {
    const doc = {
      _id: payment.id.value,
      quotationId: payment.quotationId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      gatewayTransactionId: payment.gatewayTransactionId,
      cardLast4: payment.cardLast4,
      createdAt: payment.createdAt,
    };
    await this.paymentsModel.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
    return payment;
  }

  async findPayment(id: string): Promise<Payment | null> {
    const doc = await this.paymentsModel.findById(id).lean();
    if (!doc) return null;
    const p = new Payment(
      PaymentId.of(doc._id as string),
      doc.quotationId as string,
      doc.amount as number,
      doc.currency as string,
      doc.status as Payment['status'],
      doc.gatewayTransactionId as string | undefined,
      doc.cardLast4 as string | undefined,
      doc.createdAt as Date,
    );
    return p;
  }
}
