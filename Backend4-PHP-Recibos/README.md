# billing-service

Facturación y recibos PDF — **Laravel 11 + PostgreSQL + DomPDF + MinIO**. Cubre **CU5** (Generar Recibo) y el trigger de **CU6** (payment.completed → factura).

- REST `:8001` — `GET/POST /api/invoices`, `GET /api/invoices/{id}/download`
- Consumidor RabbitMQ `payment.completed` → emite factura → publica a n8n
- DomPDF → PDF a MinIO (bucket `receipts`) con fallback local
- n8n webhook `invoice.generated` → email + WhatsApp/log

## Dev

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8001          # API
php artisan billing:consume-payments   # consumer RabbitMQ (terminal aparte)
```

## Flujo CU5

1. `payment.completed` llega por RabbitMQ (o `POST /api/invoices` manual)
2. `InvoiceService.issue()` calcula IVA 13%, numera y persiste
3. `PdfReceiptService` renderiza `receipts/invoice.blade.php` → MinIO
4. `N8nNotifier` POST al webhook → n8n envía email/WhatsApp
