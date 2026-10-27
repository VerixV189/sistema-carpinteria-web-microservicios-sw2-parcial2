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

        try {
            Storage::disk('s3')->put($path, $binary, ['ContentType' => 'application/pdf']);
        } catch (\Throwable $e) {
            Log::warning('MinIO/S3 no disponible, guardando PDF local: '.$e->getMessage());
            Storage::disk('local')->put($path, $binary);
        }

        $invoice->update(['pdf_path' => $path]);

        return $path;
    }
}
