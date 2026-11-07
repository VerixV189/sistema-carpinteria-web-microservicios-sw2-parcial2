<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Services\InvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InvoiceController extends Controller
{
    public function __construct(private readonly InvoiceService $service) {}

    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with('items')->orderByDesc('issued_at');

        if ($request->has('client_email')) {
            $query->where('client_email', $request->query('client_email'));
        }

        return response()->json($query->paginate(20));
    }

    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json($invoice->load('items'));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_nit' => 'nullable|string|max:20',
            'client_email' => 'nullable|email',
            'order_id' => 'nullable|integer',
            'payment_id' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $invoice = $this->service->issue($data, $data['items']);

        return response()->json($invoice->load('items'), 201);
    }

    public function download(Invoice $invoice)
    {
        $content = null;

        if ($invoice->pdf_path && config('filesystems.disks.s3.bucket')) {
            try {
                if (Storage::disk('s3')->exists($invoice->pdf_path)) {
                    $content = Storage::disk('s3')->get($invoice->pdf_path);
                }
            } catch (\Throwable) {
                $content = null;
            }
        }

        if (! $content && $invoice->pdf_path && Storage::disk('local')->exists($invoice->pdf_path)) {
            $content = Storage::disk('local')->get($invoice->pdf_path);
        }

        // Si el archivo no existe en disco o S3 no está configurado, se genera en memoria con DomPDF
        if (! $content) {
            $invoice->loadMissing('items');
            $content = Pdf::loadView('receipts.invoice', ['invoice' => $invoice])
                ->setPaper('letter')
                ->output();
        }

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$invoice->series.'-'.$invoice->number.'.pdf"',
        ]);
    }
}
