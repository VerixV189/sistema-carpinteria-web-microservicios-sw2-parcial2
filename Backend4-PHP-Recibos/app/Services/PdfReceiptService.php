<?php

namespace App\Services;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
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

        // Siempre guardar copia en disco local para descarga rápida y resiliente
        Storage::disk('local')->put($path, $binary);

        // Si el bucket S3 / MinIO está configurado en .env, subir también al bucket S3
        if (config('filesystems.disks.s3.bucket')) {
            try {
                Storage::disk('s3')->put($path, $binary, ['ContentType' => 'application/pdf']);
            } catch (\Throwable $e) {
                Log::warning('MinIO/S3 no disponible, usando copia local del PDF: '.$e->getMessage());
            }
        }

        $invoice->update(['pdf_path' => $path]);

        return $path;
    }
}
