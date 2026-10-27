<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #333; }
    .header { border-bottom: 3px solid #3B2F2F; padding-bottom: 12px; margin-bottom: 16px; }
    .header h1 { color: #3B2F2F; margin: 0 0 4px; font-size: 20px; }
    .header p { margin: 2px 0; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { background: #3B2F2F; color: #fff; padding: 8px; text-align: left; }
    td { padding: 7px 8px; border-bottom: 1px solid #ddd; }
    .right { text-align: right; }
    .totals { margin-top: 12px; width: 40%; margin-left: auto; }
    .totals td { border: none; padding: 4px 8px; }
    .totals .grand { font-weight: bold; font-size: 14px; border-top: 2px solid #3B2F2F; }
    .footer { margin-top: 30px; font-size: 9px; color: #888; text-align: center; }
    .badge { display:inline-block; background:#27ae60; color:#fff; padding:2px 8px; border-radius:3px; font-size:9px; }
</style>
</head>
<body>
    <div class="header">
        <h1>Carpintería "El Roble"</h1>
        <p>Av. Los Carpinteros #123 — La Paz, Bolivia</p>
        <p>NIT: 1023456789 — Tel: +591 2 2445566</p>
    </div>

    <h2 style="font-size:14px; margin-bottom:4px;">RECIBO / FACTURA N° {{ $invoice->series }}-{{ str_pad($invoice->number, 6, '0', STR_PAD_LEFT) }}</h2>
    <span class="badge">{{ $invoice->status }}</span>

    <table>
        <tr>
            <td><strong>Cliente:</strong> {{ $invoice->client_name }}</td>
            <td class="right"><strong>NIT/CI:</strong> {{ $invoice->client_nit }}</td>
        </tr>
        <tr>
            <td><strong>Fecha:</strong> {{ $invoice->issued_at?->format('d/m/Y H:i') }}</td>
            <td class="right"><strong>Pedido:</strong> {{ $invoice->order_id ? '#'.$invoice->order_id : '—' }}</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr><th>Descripción</th><th class="right">Cant.</th><th class="right">P. Unit.</th><th class="right">Total</th></tr>
        </thead>
        <tbody>
        @foreach($invoice->items as $item)
            <tr>
                <td>{{ $item->description }}</td>
                <td class="right">{{ rtrim(rtrim(number_format($item->quantity, 2), '0'), '.') }}</td>
                <td class="right">{{ number_format($item->unit_price, 2) }}</td>
                <td class="right">{{ number_format($item->line_total, 2) }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr><td>Subtotal:</td><td class="right">Bs. {{ number_format($invoice->subtotal, 2) }}</td></tr>
        <tr><td>IVA (13%):</td><td class="right">Bs. {{ number_format($invoice->tax, 2) }}</td></tr>
        <tr class="grand"><td>TOTAL:</td><td class="right">Bs. {{ number_format($invoice->total, 2) }}</td></tr>
    </table>

    <div class="footer">
        Gracias por su compra. Este documento es un recibo de pago generado electrónicamente.<br>
        billing-service · carpinteria-system
    </div>
</body>
</html>
