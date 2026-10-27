<?php

namespace Database\Seeders;

use App\Models\Invoice;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $invoice = Invoice::firstOrCreate(
            ['number' => 1],
            [
                'series' => 'A',
                'client_name' => 'María López',
                'client_nit' => '4567890',
                'client_email' => 'maria@example.com',
                'subtotal' => 3200.00,
                'tax' => 416.00,
                'total' => 3616.00,
                'status' => 'ISSUED',
                'issued_at' => now(),
            ]
        );

        if ($invoice->wasRecentlyCreated) {
            $invoice->items()->create([
                'description' => 'Ropero 3 puertas - madera pino',
                'quantity' => 1,
                'unit_price' => 3200.00,
                'line_total' => 3200.00,
            ]);
        }
    }
}
