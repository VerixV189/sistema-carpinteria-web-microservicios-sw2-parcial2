import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamodbConfig {
  readonly raw: DynamoDBClient;
  readonly doc: DynamoDBDocumentClient;

  constructor(config: ConfigService) {
    this.raw = new DynamoDBClient({
      endpoint: config.get<string>('DYNAMODB_ENDPOINT', 'http://localhost:8000'),
      region: config.get<string>('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID', 'local'),
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY', 'local'),
      },
    });
    this.doc = DynamoDBDocumentClient.from(this.raw);
  }
}
