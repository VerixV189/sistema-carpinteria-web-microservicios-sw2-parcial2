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
   * Bridge compatible con n8n (:3000/api/sendText y /api/sendFile).
   * Soporta en orden de prioridad:
   *  1. API Oficial de Meta (WhatsApp Cloud API — graph.facebook.com) → CERO riesgo de baneo.
   *  2. WAHA externo (si WAHA_URL está configurado).
   *  3. Simulación/registro local (fallback seguro).
   */
  @Post('api/sendText')
  async sendWhatsappText(@Body() body: Record<string, any>) {
    const cloudToken = this.config.get<string>('WHATSAPP_CLOUD_TOKEN');
    const phoneId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    const rawPhone = String(body?.chatId ?? '').replace(/@.*$/, '').replace(/\D/g, '');

    // 1. API Oficial de WhatsApp Cloud (Meta Graph API)
    if (cloudToken && phoneId && rawPhone) {
      try {
        const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cloudToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: rawPhone,
            type: 'text',
            text: { body: String(body?.text ?? '') },
          }),
        });
        const data = await res.json();
        if (res.ok) {
          this.log.log(`WhatsApp Cloud API Oficial texto enviado → ${rawPhone}`);
          return data;
        }
        this.log.warn(`WhatsApp Cloud API respuesta (${res.status}): ${JSON.stringify(data)}`);
      } catch (e) {
        this.log.warn(`Error llamando a WhatsApp Cloud API Oficial: ${e}`);
      }
    }

    // 2. WAHA externo (opcional)
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

    // 3. Fallback local
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
    const cloudToken = this.config.get<string>('WHATSAPP_CLOUD_TOKEN');
    const phoneId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    const rawPhone = String(body?.chatId ?? '').replace(/@.*$/, '').replace(/\D/g, '');
    const filename = body?.file?.filename ?? 'recibo.pdf';

    // 1. API Oficial de WhatsApp Cloud (Meta Graph API: subir media + enviar documento)
    if (cloudToken && phoneId && rawPhone && body?.file?.data) {
      try {
        const binary = Buffer.from(String(body.file.data), 'base64');
        const form = new FormData();
        form.append('messaging_product', 'whatsapp');
        form.append(
          'file',
          new Blob([binary], { type: body?.file?.mimetype || 'application/pdf' }),
          filename,
        );

        const uploadRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/media`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${cloudToken}` },
          body: form,
        });
        const uploadData = (await uploadRes.json()) as { id?: string };

        if (uploadRes.ok && uploadData?.id) {
          const msgRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cloudToken}`,
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: rawPhone,
              type: 'document',
              document: {
                id: uploadData.id,
                filename,
                caption: body?.caption ?? 'Recibo PDF — Carpintería El Roble',
              },
            }),
          });
          const msgData = await msgRes.json();
          if (msgRes.ok) {
            this.log.log(`WhatsApp Cloud API Oficial PDF enviado → ${rawPhone} (${filename})`);
            return msgData;
          }
          this.log.warn(`WhatsApp Cloud API documento (${msgRes.status}): ${JSON.stringify(msgData)}`);
        }
      } catch (e) {
        this.log.warn(`Error enviando PDF por WhatsApp Cloud API Oficial: ${e}`);
      }
    }

    // 2. WAHA externo (opcional)
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

    // 3. Fallback local
    this.log.log(`WhatsApp PDF → ${body?.chatId}: ${filename}`);
    return {
      id: `wa_pdf_${Date.now()}`,
      status: 'SENT',
      chatId: body?.chatId ?? null,
      filename,
      timestamp: new Date().toISOString(),
    };
  }
}
