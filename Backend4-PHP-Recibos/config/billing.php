<?php

return [
    'n8n_webhook' => env('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook/invoice-generated'),
    'webhook_secret' => env('WEBHOOK_SECRET', 'carpinteria-webhook-dev'),
    'business_graphql' => env('BUSINESS_GRAPHQL_URL', 'http://localhost:8080/graphql'),
    'rabbitmq' => [
        'host' => env('RABBITMQ_HOST', 'localhost'),
        'port' => (int) env('RABBITMQ_PORT', 5672),
        'user' => env('RABBITMQ_USER', 'guest'),
        'password' => env('RABBITMQ_PASSWORD', 'guest'),
        'vhost' => env('RABBITMQ_VHOST', '/'),
        'exchange' => env('RABBITMQ_EXCHANGE', 'carpinteria.events'),
    ],
];
