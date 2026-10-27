<?php

namespace App\Console\Commands;

use App\Services\InvoiceService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

/**
 * payment.completed → emite la factura automáticamente (CU5/CU6).
 *
 * php artisan billing:consume-payments
 */
class ConsumePayments extends Command
{
    protected $signature = 'billing:consume-payments';
    protected $description = 'Consume payment.completed de RabbitMQ y emite facturas';

    public function handle(InvoiceService $service): int
    {
        $cfg = config('billing.rabbitmq');

        $connection = new AMQPStreamConnection($cfg['host'], $cfg['port'], $cfg['user'], $cfg['password'], $cfg['vhost']);
        $channel = $connection->channel();
        $channel->exchange_declare($cfg['exchange'], 'topic', false, true, false);
        [$queue] = $channel->queue_declare('billing.payment_completed', false, true, false, false);
        $channel->queue_bind($queue, $cfg['exchange'], 'payment.completed');

        $this->info('Consumidor billing.payment_completed activo');

        $channel->basic_consume($queue, '', false, false, false, false, function (AMQPMessage $msg) use ($service, $channel) {
            try {
                $payload = json_decode($msg->getBody(), true, 512, JSON_THROW_ON_ERROR);
                $service->issue([
                    'client_name' => $payload['clientName'] ?? 'Cliente',
                    'client_email' => $payload['clientEmail'] ?? null,
                    'order_id' => $payload['orderId'] ?? null,
                    'payment_id' => $payload['paymentId'] ?? null,
                ], $payload['items'] ?? [[
                    'description' => 'Pedido #'.($payload['orderId'] ?? '?'),
                    'quantity' => 1,
                    'unit_price' => (float) ($payload['amount'] ?? 0),
                ]]);
            } catch (\Throwable $e) {
                Log::error('Error procesando payment.completed: '.$e->getMessage());
            }
            $channel->basic_ack($msg->getDeliveryTag());
        });

        while ($channel->is_consuming()) {
            $channel->wait();
        }

        return self::SUCCESS;
    }
}
