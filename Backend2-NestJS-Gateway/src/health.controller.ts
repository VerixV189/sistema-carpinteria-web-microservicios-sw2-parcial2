import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  health() {
    return {
      status: 'ok',
      service: 'gateway-service',
      timestamp: new Date().toISOString(),
      routes: {
        graphql: this.config.get('BUSINESS_SERVICE_URL'),
        'api/quotations': this.config.get('QUOTATION_SERVICE_URL'),
        'api/payments': this.config.get('QUOTATION_SERVICE_URL'),
        'api/ai': this.config.get('AI_SERVICE_URL'),
        'api/invoices': this.config.get('BILLING_SERVICE_URL'),
      },
    };
  }
}
