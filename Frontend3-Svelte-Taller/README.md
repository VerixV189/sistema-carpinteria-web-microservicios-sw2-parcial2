# workshop-app

App del taller — **SvelteKit** (CU4 fechas de entrega). Puerto `:4204`, ruta `/taller/*`.

- Verifica capacidad: `GET :8100/ai/delivery/check?date=YYYY-MM-DD` (MCP `check_delivery_date` vía REST)
- Agenda entrega: `POST /api/deliveries` → business-service
- Lista entregas vía GraphQL

```bash
npm install && npm run dev   # http://localhost:4204/taller/
```
