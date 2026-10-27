# Automatizacion-N8N

Workflows de n8n que reaccionan a los eventos de dominio (CU5/CU6 + alertas) y
el canal WhatsApp vía **WAHA** (`devlikeapro/waha:noweb`, contenedor `carpinteria-waha`).

| Workflow | Trigger | Flujo |
|----------|---------|-------|
| `01-invoice-generated.json` | `POST /webhook/invoice-generated` | descarga PDF → email (Mailpit) → **WhatsApp real** (texto + PDF vía WAHA) — fallback a log si no hay teléfono |
| `02-payment-completed.json` | `POST /webhook/payment-completed` | `updateOrderStatus(APPROVED)` vía GraphQL + dispara factura en billing |
| `03-quotation-approved.json` | `POST /webhook/quotation-approved` | `createOrder` en business-service + email |
| `04-low-stock-alert.json` | `POST /webhook/material-low-stock` | resumen IA (`/ai/report`) + email al taller |
| `05-daily-report.json` | cron 08:00 | reporte IA → email al admin |
| `06-whatsapp-agent.json` | `POST /webhook/whatsapp-incoming` (desde WAHA evento `message`) | mensaje → `/ai/agent` (`session_id`=número, con memoria) → reply WhatsApp |

## WAHA — pairing (una sola vez)

```bash
docker compose -f Infraestructura/docker-compose.yml up -d waha
# esperar ~20s a que levante, crear/iniciar sesión y abrir el QR:
curl -X POST http://localhost:8002/api/sessions -H "X-Api-Key: carpinteria-waha-dev"   -H "Content-Type: application/json" -d '{"name":"default","start":true}'
# QR en el navegador: http://localhost:8002/api/default/auth/qr
```

Escanear con WhatsApp → "Dispositivos vinculados". La sesión persiste en el
volumen `waha-data`. API REST en `:8002` con header `api_key` (`WAHA_API_KEY`,
default `carpinteria-waha-dev`).

**Nota:** API **no oficial** (sesión de WhatsApp Web): válido para demo/desarrollo;
para producción usar WhatsApp Business API (Meta).

## Importar (CLI)

```bash
# credencial SMTP → Mailpit (host "mailpit":1025 en la red docker)
docker exec carpinteria-n8n n8n import:credentials \
  --input=/opt/workflows/credentials/smtp-mailpit.json

# workflows
for f in 01-invoice-generated 02-payment-completed 03-quotation-approved 04-low-stock-alert 05-daily-report 06-whatsapp-agent; do
  docker exec carpinteria-n8n n8n import:workflow --input=/opt/workflows/workflows/$f.json
done

# publicar (ver IDs con `n8n list:workflow`) y reiniciar
docker exec carpinteria-n8n n8n publish:workflow --id=<ID>
docker restart carpinteria-n8n
```

Notas verificadas:
- El body del webhook llega en `$json.body.*` (no `$json.*`).
- `emailSend` requiere `fromEmail` + credencial SMTP — los emails caen en **Mailpit** (`http://localhost:8025`).
- Los HTTP nodes usan nombres de servicio docker (`billing-service`, `business-service`, `ai-service`, `waha`), no `localhost`.
- WhatsApp: `/api/sendText`/`/api/sendFile` a `http://waha:3000` con header `X-Api-Key`; teléfono
  del cliente se resuelve vía GraphQL `clients{email phone}` → `591XXXXXXXX@c.us`.
- Si el cliente no tiene teléfono u WAHA no responde → nodo de log (fallback).
