<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('detail_keranjangs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('keranjang_id')
                  ->constrained('keranjangs')
                  ->onDelete('cascade');
            $table->foreignId('produk_id')
                  ->constrained('produks')
                  ->onDelete('cascade');
            $table->unsignedInteger('jumlah') ->default(1);
            $table->timestamps();

            $table->unique(['keranjang_id', 'produk_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_keranjangs');
    }
};
