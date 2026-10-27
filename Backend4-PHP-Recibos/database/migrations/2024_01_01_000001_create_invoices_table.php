<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('number')->unique();
            $table->string('series', 5)->default('A');
            $table->string('client_name');
            $table->string('client_nit', 20)->default('0');
            $table->string('client_email')->nullable();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->string('payment_id')->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax', 12, 2);
            $table->decimal('total', 12, 2);
            $table->string('status', 20)->default('ISSUED');
            $table->timestamp('issued_at')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamps();

            $table->index(['client_email', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
