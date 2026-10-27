# admin-app

Panel administrativo — **Angular 18 + Apollo GraphQL** (CU1/CU2/CU7). Puerto `:4202`, ruta `/admin/*`.

- Clientes / Carpinteros → GraphQL mutations+queries (gateway → business-service)
- Pedidos → query + suscripción `orderUpdated` (tiempo real)
- Reportes IA → `POST :8100/ai/report` (Text-to-SQL CU7)

```bash
npm install && npm run dev   # http://localhost:4202/admin
```

Como microfrontend se construye con `ng build` y se sirve `main.js` (Single-SPA Angular lifecycles en `src/main.ts`).
