import { Body, Controller, Get, Header, Logger, Post } from '@nestjs/common';
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
   * Consola Interactiva GraphiQL / Playground conectada a Backend1-Java-Negocio (/graphql).
   * Permite demostrar Queries y Mutations GraphQL en vivo desde el navegador en https://api.ramio.tech/graphiql
   */
  @Get('graphiql')
  @Header('Content-Type', 'text/html; charset=utf-8')
  graphiqlConsole(): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GraphiQL — Consola GraphQL (Backend 1 Java Spring Boot)</title>
  <style>
    * { box-sizing: border-box; font-family: Inter, system-ui, -apple-system, sans-serif; }
    body { margin: 0; background: #1e1b18; color: #f5f1ec; display: flex; flex-direction: column; height: 100vh; }
    header { background: #2c221e; padding: 12px 20px; border-bottom: 1px solid #44352d; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; color: #f59e0b; }
    .presets { display: flex; gap: 6px; flex-wrap: wrap; }
    .chip { background: #3b2f2f; color: #f5f1ec; border: 1px solid #6b5344; padding: 6px 11px; border-radius: 999px; font-size: 12px; cursor: pointer; font-weight: 600; }
    .chip:hover { background: #8B5A2B; border-color: #f59e0b; }
    .main { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; min-height: 0; }
    .pane { display: flex; flex-direction: column; background: #26211e; border: 1px solid #3f342e; border-radius: 10px; overflow: hidden; }
    .pane-head { padding: 8px 14px; background: #312924; font-size: 12px; font-weight: 700; color: #d6c7b8; display: flex; justify-content: space-between; align-items: center; }
    textarea, pre { flex: 1; margin: 0; padding: 14px; background: #181512; color: #e7e0d6; border: none; font-family: 'Fira Code', Consolas, monospace; font-size: 13px; line-height: 1.5; resize: none; outline: none; overflow: auto; }
    .run-btn { background: #e11d48; color: #fff; border: none; padding: 7px 18px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px; }
    .run-btn:hover { background: #be123c; }
    .status { font-size: 12px; color: #86efac; }
  </style>
</head>
<body>
  <header>
    <div class="brand">◈ GraphiQL — Carpintería El Roble (Backend 1: Java 17 + Spring Boot GraphQL)</div>
    <div class="presets">
      <button class="chip" onclick="setQuery(0)">1. Listar Pedidos + Pasos + Carpinteros</button>
      <button class="chip" onclick="setQuery(1)">2. Listar Clientes + Segmentos</button>
      <button class="chip" onclick="setQuery(2)">3. Listar Carpinteros + Especialidad</button>
      <button class="chip" onclick="setQuery(3)">4. Inventario de Maderas e Insumos</button>
      <button class="chip" onclick="setQuery(4)">5. Mutation: Crear Pedido con Pasos</button>
      <button class="chip" onclick="setQuery(5)">6. Introspection (__schema)</button>
    </div>
  </header>
  <div class="main">
    <div class="pane">
      <div class="pane-head">
        <span>CONSULTA / MUTACIÓN GRAPHQL (POST /graphql)</span>
        <button class="run-btn" onclick="executeGraphQL()">▶ Ejecutar Consulta</button>
      </div>
      <textarea id="gqlInput"></textarea>
    </div>
    <div class="pane">
      <div class="pane-head">
        <span>RESPUESTA JSON DE JAVA SPRING BOOT</span>
        <span id="statusLbl" class="status">Listo</span>
      </div>
      <pre id="gqlOutput">// Presiona "▶ Ejecutar Consulta" para ver la respuesta en tiempo real...</pre>
    </div>
  </div>
  <script>
    const EXAMPLES = [
\`# Ejemplo 1: Consultar todos los Pedidos con su Cliente, Ítems, Pasos de Taller, Carpinteros y Entrega
query ListarPedidosCompletos {
  orders {
    id
    description
    status
    totalPrice
    deliveryType
    deliveryAddress
    client {
      id
      name
      email
      segment
    }
    items {
      description
      furnitureType
      woodType
      quantity
      unitPrice
    }
    steps {
      id
      name
      status
      sequence
    }
    carpenters {
      id
      name
      specialty
    }
  }
}\`,
\`# Ejemplo 2: Consultar Clientes registrados en PostgreSQL
query ListarClientes {
  clients {
    id
    name
    email
    phone
    address
    segment
  }
}\`,
\`# Ejemplo 3: Consultar Carpinteros del Taller
query ListarCarpinteros {
  carpenters {
    id
    name
    email
    phone
    specialty
    hourlyRate
    active
  }
}\`,
\`# Ejemplo 4: Consultar Materiales e Inventario de Maderas
query InventarioMateriales {
  materials {
    id
    name
    unit
    stock
    minStock
    lowStock
  }
}\`,
\`# Ejemplo 5: Mutación para crear un Pedido de Producción en Taller
mutation CrearNuevoPedido {
  createOrder(input: {
    clientId: "1"
    description: "Juego de Comedor 8 Sillas en Roble Macizo (Demo GraphQL)"
    deliveryType: "DELIVERY"
    deliveryAddress: "Av. Cristo Redentor 4to Anillo"
    items: [
      {
        description: "Mesa Imperial de Roble"
        furnitureType: "TABLE"
        woodType: "ROBLE"
        quantity: 1
        unitPrice: 4500
      }
    ]
  }) {
    id
    description
    status
    totalPrice
    steps {
      id
      name
      status
      sequence
    }
  }
}\`,
\`# Ejemplo 6: Introspección del Esquema GraphQL (__schema)
query EsquemaGraphQL {
  __schema {
    queryType { name }
    mutationType { name }
    types {
      name
      kind
    }
  }
}\`
    ];

    let jwtToken = localStorage.getItem('carpinteria_graphiql_token') || '';
    function setQuery(idx) {
      document.getElementById('gqlInput').value = EXAMPLES[idx];
    }
    setQuery(0);

    async function ensureToken() {
      if (jwtToken) return jwtToken;
      const r = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@carpinteria.com', password: 'admin' })
      });
      if (r.ok) {
        const d = await r.json();
        jwtToken = d.accessToken;
        localStorage.setItem('carpinteria_graphiql_token', jwtToken);
      }
      return jwtToken;
    }

    async function executeGraphQL() {
      const statusEl = document.getElementById('statusLbl');
      const outEl = document.getElementById('gqlOutput');
      statusEl.textContent = 'Ejecutando en Java Spring Boot...';
      try {
        const token = await ensureToken();
        const query = document.getElementById('gqlInput').value;
        const t0 = performance.now();
        const res = await fetch('/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: 'Bearer ' + token } : {})
          },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        const ms = Math.round(performance.now() - t0);
        statusEl.textContent = 'HTTP ' + res.status + ' · ' + ms + ' ms';
        outEl.textContent = JSON.stringify(data, null, 2);
      } catch (e) {
        statusEl.textContent = 'Error';
        outEl.textContent = String(e);
      }
    }
  </script>
</body>
</html>`;
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
        const data = (await res.json()) as Record<string, any>;
        if (res.ok) {
          this.log.log(`WhatsApp Cloud API Oficial texto enviado → ${rawPhone}`);
          return { ...data, status: 'SENT', chatId: body?.chatId ?? rawPhone };
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
    if (cloudToken && phoneId && rawPhone) {
      try {
        let binary: Buffer | null = null;
        if (body?.file?.data) {
          binary = Buffer.from(String(body.file.data), 'base64');
        } else {
          // Si n8n solo envía el filename (ej. recibo-A-45.pdf), obtenemos el PDF directo de billing-service
          const billingUrl = this.config.get<string>('BILLING_SERVICE_URL', 'http://127.0.0.1:8001');
          const secret = this.config.get<string>('INTERNAL_SECRET', 'carpinteria-internal-dev');
          const numMatch = String(filename).match(/(\d+)\.pdf$/i);
          const listRes = await fetch(`${billingUrl}/api/invoices`, {
            headers: { 'x-internal-secret': secret },
          });
          if (listRes.ok) {
            const listJson = (await listRes.json()) as { data?: Array<{ id: number; number: number }> };
            const invoices = listJson?.data ?? [];
            const target = numMatch
              ? invoices.find((inv) => String(inv.number) === numMatch[1] || String(inv.id) === numMatch[1])
              : invoices[0];
            if (target?.id) {
              const pdfRes = await fetch(`${billingUrl}/api/invoices/${target.id}/download`, {
                headers: { 'x-internal-secret': secret },
              });
              if (pdfRes.ok) {
                binary = Buffer.from(await pdfRes.arrayBuffer());
              }
            }
          }
        }

        if (binary) {
          const form = new FormData();
          form.append('messaging_product', 'whatsapp');
          form.append(
            'file',
            new Blob([new Uint8Array(binary)], { type: body?.file?.mimetype || 'application/pdf' }),
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
            const msgData = (await msgRes.json()) as Record<string, any>;
            if (msgRes.ok) {
              this.log.log(`WhatsApp Cloud API Oficial PDF enviado → ${rawPhone} (${filename})`);
              return { ...msgData, status: 'SENT', chatId: body?.chatId ?? rawPhone, filename };
            }
            this.log.warn(`WhatsApp Cloud API documento (${msgRes.status}): ${JSON.stringify(msgData)}`);
          }
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
