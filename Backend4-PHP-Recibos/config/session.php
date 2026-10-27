<?php

return [
    'driver' => env('SESSION_DRIVER', 'file'),
    'lifetime' => 120,
    'files' => storage_path('framework/sessions'),
    'cookie' => 'billing_session',
];
