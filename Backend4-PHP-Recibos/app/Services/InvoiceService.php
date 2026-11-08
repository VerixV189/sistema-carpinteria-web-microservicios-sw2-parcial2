<?php

namespace App\Services;

use App\Models\Invoice;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * CU5 - Lógica de facturación: emitir, numerar y disparar entrega vía n8n.
 */
class InvoiceService
{
    private const TAX_RATE = 0.13; // IVA Bolivia 13%

    public function __construct(
        private readonly PdfReceiptService $pdf,
        private readonly N8nNotifier $n8n,
    ) {}

    /** @param array<int, array{description:string,quantity:float,unit_price:float}> $items */
    public function issue(array $data, array $items): Invoice
    {
        // Reintenta ante colisión del número correlativo (unique) en emisiones concurrentes.
        return retry(3, fn () => $this->issueOnce($data, $items), 100, function (\Throwable $e) {
            return str_contains($e->getMessage(), 'invoices_number_unique');
        });
    }

    /** @param array<int, array{description:string,quantity:float,unit_price:float}> $items */
    private function issueOnce(array $data, array $items): Invoice
    {
        return DB::transaction(function () use ($data, $items) {
            try {
                DB::statement('LOCK TABLE invoices IN SHARE ROW EXCLUSIVE MODE');
            } catch (\Throwable) {
                // En caso de SQLite en tests unitarios, ignorar el LOCK TABLE de PostgreSQL
            }

            // Idempotencia por payment_id: evita duplicar el recibo cuando tanto
            // el consumidor RabbitMQ como el webhook de n8n procesan el mismo pago.
            if (! empty($data['payment_id'])) {
                $existing = Invoice::with('items')
                    ->where('payment_id', $data['payment_id'])
                    ->first();
                if ($existing) {
                    Log::info("Factura existente #{$existing->number} reutilizada para payment_id {$data['payment_id']}");
                    return $existing;
                }
            }

            $subtotal = collect($items)->sum(fn ($i) => $i['quantity'] * $i['unit_price']);
            $tax = round($subtotal * self::TAX_RATE, 2);

            $invoice = Invoice::create([
                'number' => $this->nextNumber(),
                'series' => 'A',
                'client_name' => $data['client_name'],
                'client_nit' => $data['client_nit'] ?? '0',
                'client_email' => $data['client_email'] ?? null,
                'order_id' => $data['order_id'] ?? null,
                'payment_id' => $data['payment_id'] ?? null,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => round($subtotal + $tax, 2),
                'status' => 'ISSUED',
                'issued_at' => now(),
            ]);

            foreach ($items as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'line_total' => round($item['quantity'] * $item['unit_price'], 2),
                ]);
            }

            $invoice->refresh();
            $this->pdf->generate($invoice);
            // Notificar DESPUÉS del commit: n8n consulta la factura por HTTP y
            // no la vería si aún está en transacción (race condition).
            DB::afterCommit(fn () => $this->n8n->notifyInvoiceGenerated($invoice));

            Log::info("Factura {$invoice->number} emitida para {$invoice->client_name}");

            return $invoice;
        });
    }

    private function nextNumber(): int
    {
        return (int) Invoice::max('number') + 1;
    }
}
