import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamodbConfig {
  readonly raw: DynamoDBClient;
  readonly doc: DynamoDBDocumentClient;

  constructor(config: ConfigService) {
    const accessKeyId = config.get<string>('AWS_ACCESS_KEY_ID', 'local');
    const secretAccessKey = config.get<string>('AWS_SECRET_ACCESS_KEY', 'local');
    const region =
      config.get<string>('AWS_REGION') ||
      config.get<string>('AWS_S3_REGION') ||
      config.get<string>('AWS_DEFAULT_REGION') ||
      'us-east-2';
    const rawEndpoint = config.get<string>('DYNAMODB_ENDPOINT');
    const isRealAws =
      Boolean(accessKeyId && secretAccessKey) &&
      accessKeyId !== 'local' &&
      !accessKeyId.startsWith('PEGA_AQUI');

    // Si hay credenciales reales de AWS IAM, conectamos a AWS DynamoDB real en la nube
    // (ignorando localhost:8000 del .env.example).
    const endpoint =
      isRealAws && (!rawEndpoint || rawEndpoint.includes('localhost') || rawEndpoint.includes('127.0.0.1') || rawEndpoint.includes('dynamodb:'))
        ? undefined
        : rawEndpoint || 'http://localhost:8000';

    this.raw = new DynamoDBClient({
      ...(endpoint ? { endpoint } : {}),
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.doc = DynamoDBDocumentClient.from(this.raw);
  }
}
