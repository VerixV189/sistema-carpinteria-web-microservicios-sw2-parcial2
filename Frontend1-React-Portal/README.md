# client-portal

Portal del cliente — **React 19 + Vite** (CU3 cotización IA, CU6 pago mock, CU5 recibos). Puerto `:4203`, ruta `/cliente/*`.

- `/cotizar` — describe el mueble → `POST :8100/ai/estimate` → crea cotización
- `/pagar/:id` — mock Stripe (4242… aprueba)
- `/recibos` — facturas vía `GET :8001/api/invoices`

```bash
npm install && npm run dev   # http://localhost:4203/cliente/
```
