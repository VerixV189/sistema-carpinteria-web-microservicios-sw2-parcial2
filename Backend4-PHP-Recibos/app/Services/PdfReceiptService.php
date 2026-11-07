<?php

namespace App\Services;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * CU5 - Genera el recibo PDF (DomPDF) y lo sube a MinIO (S3).
 * Si MinIO no está disponible, guarda en disco local como fallback.
 */
class PdfReceiptService
{
    public function generate(Invoice $invoice): ?string
    {
        $invoice->loadMissing('items');

        $pdf = Pdf::loadView('receipts.invoice', ['invoice' => $invoice])
            ->setPaper('letter');

        $path = sprintf('receipts/%s-%s.pdf', $invoice->series, $invoice->number);
        $binary = $pdf->output();

        // 1. Siempre guardar copia en disco local para descarga rápida y resiliente
        Storage::disk('local')->put($path, $binary);

        // 2. Subir al bucket S3 a través del Gateway (usa las credenciales AWS de Backend2 en us-east-2)
        try {
            $gatewayUrl = env('GATEWAY_INTERNAL_URL', 'http://127.0.0.1:3000');
            Http::timeout(8)
                ->withHeader('x-internal-secret', config('billing.internal_secret', 'carpinteria-internal-dev'))
                ->post("{$gatewayUrl}/api/uploads/s3-internal", [
                    'fileName' => sprintf('%s-%s.pdf', $invoice->series, $invoice->number),
                    'mimeType' => 'application/pdf',
                    'base64' => base64_encode($binary),
                    'folder' => 'receipts',
                ]);
        } catch (\Throwable $e) {
            Log::warning('Gateway S3 upload no disponible: '.$e->getMessage());
        }

        // 3. Si el bucket S3 / MinIO también está configurado directamente en PHP .env
        if (config('filesystems.disks.s3.bucket')) {
            try {
                Storage::disk('s3')->put($path, $binary, ['ContentType' => 'application/pdf']);
            } catch (\Throwable $e) {
                Log::warning('MinIO/S3 directo no disponible, usando copia local del PDF: '.$e->getMessage());
            }
        }

        $invoice->update(['pdf_path' => $path]);

        return $path;
    }
}
