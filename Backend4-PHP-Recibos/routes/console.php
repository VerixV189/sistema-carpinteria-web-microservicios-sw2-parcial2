<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('billing:ping', function () {
    $this->info('billing-service OK');
});
