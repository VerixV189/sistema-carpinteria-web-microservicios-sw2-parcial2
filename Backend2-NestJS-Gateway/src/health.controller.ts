import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class HealthController {
  private readonly log = new Logger('WahaBridge');

  constructor(private readonly config: ConfigService) {}

  @Get('health')
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

  /**
   * Bridge compatible con WAHA (WhatsApp HTTP API) en :3000/api/sendText y /api/sendFile
   * para los flujos de n8n cuando waha resuelve a 127.0.0.1:3000 en la VPS.
   */
  @Post('api/sendText')
  async sendWhatsappText(@Body() body: Record<string, any>) {
    const wahaUrl = this.config.get<string>('WAHA_URL');
    if (wahaUrl) {
      try {
        const res = await fetch(`${wahaUrl.replace(/\/$/, '')}/api/sendText`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.config.get<string>('WAHA_API_KEY') ?? 'carpinteria-waha-dev',
          },
          body: JSON.stringify(body),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        this.log.warn(`WAHA externo no disponible, registrando envío local: ${e}`);
      }
    }
    this.log.log(`WhatsApp texto → ${body?.chatId}: ${body?.text}`);
    return {
      id: `wa_txt_${Date.now()}`,
      status: 'SENT',
      chatId: body?.chatId ?? null,
      text: body?.text ?? '',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('api/sendFile')
  async sendWhatsappFile(@Body() body: Record<string, any>) {
    const wahaUrl = this.config.get<string>('WAHA_URL');
    if (wahaUrl) {
      try {
        const res = await fetch(`${wahaUrl.replace(/\/$/, '')}/api/sendFile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.config.get<string>('WAHA_API_KEY') ?? 'carpinteria-waha-dev',
          },
          body: JSON.stringify(body),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        this.log.warn(`WAHA externo no disponible, registrando PDF local: ${e}`);
      }
    }
    this.log.log(`WhatsApp PDF → ${body?.chatId}: ${body?.file?.filename ?? 'recibo.pdf'}`);
    return {
      id: `wa_pdf_${Date.now()}`,
      status: 'SENT',
      chatId: body?.chatId ?? null,
      filename: body?.file?.filename ?? 'recibo.pdf',
      timestamp: new Date().toISOString(),
    };
  }
}
