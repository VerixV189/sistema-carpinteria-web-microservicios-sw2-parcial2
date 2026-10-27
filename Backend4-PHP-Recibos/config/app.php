<?php

return [
    'name' => env('APP_NAME', 'Billing Service'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost:8001'),
    'timezone' => 'America/La_Paz',
    'locale' => 'es',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',
    // Providers y aliases: Laravel 12 los carga de bootstrap/providers.php
    // y del auto-discovery de paquetes (DomPDF se registra solo).
];
