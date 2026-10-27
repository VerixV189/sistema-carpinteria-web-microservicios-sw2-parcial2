<?php

namespace App\Services;

use App\Models\Invoice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * CU5 - Notifica a n8n tras generar el recibo (workflow invoice.generated →
 * email → WhatsApp/log). Atajo documentado: webhook en lugar de WhatsApp real.
 */
class N8nNotifier
{
    public function notifyInvoiceGenerated(Invoice $invoice): void
    {
        $url = config('billing.n8n_webhook');

        try {
            Http::timeout(5)
                ->withHeader('x-webhook-secret', config('billing.webhook_secret'))
                ->post($url, [
                'event' => 'invoice.generated',
                'invoiceId' => $invoice->id,
                'series' => $invoice->series,
                'number' => $invoice->number,
                'clientName' => $invoice->client_name,
                'clientEmail' => $invoice->client_email,
                'total' => (float) $invoice->total,
                'pdfPath' => $invoice->pdf_path,
            ]);
        } catch (\Throwable $e) {
            Log::warning('n8n webhook no disponible: '.$e->getMessage());
        }
    }
}
