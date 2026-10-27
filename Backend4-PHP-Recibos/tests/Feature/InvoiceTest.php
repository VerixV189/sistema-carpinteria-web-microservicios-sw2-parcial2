<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_issue_invoice_calculates_totals(): void
    {
        $response = $this->postJson('/api/invoices', [
            'client_name' => 'Juan Pérez',
            'client_nit' => '1234567',
            'client_email' => 'juan@example.com',
            'items' => [
                ['description' => 'Mesa de comedor', 'quantity' => 1, 'unit_price' => 1800],
                ['description' => 'Sillas', 'quantity' => 6, 'unit_price' => 450],
            ],
        ]);

        $response->assertCreated();
        $response->assertJsonPath('client_name', 'Juan Pérez');
        $this->assertEquals(4500.00, (float) $response->json('subtotal'));
        $this->assertEquals(585.00, (float) $response->json('tax'));
        $this->assertEquals(5085.00, (float) $response->json('total'));
    }

    public function test_health_endpoint(): void
    {
        $this->get('/health')->assertOk();
    }
}
