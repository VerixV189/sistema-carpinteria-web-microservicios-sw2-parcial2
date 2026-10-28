import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose, { Model, Schema } from 'mongoose';

@Injectable()
export class MongodbConfig implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(MongodbConfig.name);

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const uri = this.config.get<string>(
      'MONGO_URI',
      'mongodb://carpinteria:carpinteria@localhost:27017/carpinteria?authSource=admin',
    );
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      this.log.log('MongoDB conectado');
    } catch (err) {
      this.log.warn(`MongoDB no disponible al iniciar (${(err as Error).message}) — reconectará bajo demanda`);
    }
  }

  quotationsModel(): Model<any> {
    return mongoose.model(
      'Quotation',
      new Schema({ _id: String }, { strict: false, collection: 'quotations' }),
    );
  }

  paymentsModel(): Model<any> {
    return mongoose.model(
      'Payment',
      new Schema({ _id: String }, { strict: false, collection: 'payments' }),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await mongoose.disconnect();
  }
}
