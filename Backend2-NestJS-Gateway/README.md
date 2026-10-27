# quotation-payment-service

Cotizaciones y Pasarela de Pago — **NestJS REST**. Cubre **CU3** y **CU6**.

- MongoDB: colección `quotations` (documentos flexibles) + `payments`
- DynamoDB: tabla `payment_logs` (write-heavy, TTL 90 días)
- RabbitMQ: publica `quotation.created`, `quotation.approved`, `payment.completed`
- `payment-gateway.port.ts` → `stripe.adapter.ts` (mock: tarjetas `4242…` aprueban)
- Llama a `ai-service` para estimación de precio si la cotización llega sin total

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/quotations` | Crear cotización (con `requestEstimate:true` llama IA) |
| GET | `/api/quotations` | Listar (`?clientId=`) |
| GET | `/api/quotations/:id` | Detalle |
| POST | `/api/quotations/:id/approve` | Aprobar → evento |
| POST | `/api/quotations/:id/reject` | Rechazar |
| POST | `/api/payments` | Procesar pago (mock gateway) |
| GET | `/api/payments/:id` | Estado del pago |
| GET | `/api/payments/:id/logs` | Logs de transacción (DynamoDB) |
| POST | `/api/payments/webhook` | Webhook simulado |

## Dev

```bash
cp .env.example .env
npm install
npm run start:dev   # :3001
```

Tarjeta aprobada: `4242424242424242` · rechazada: `4000000000000002`
