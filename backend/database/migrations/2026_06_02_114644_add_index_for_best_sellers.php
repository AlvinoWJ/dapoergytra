<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('detail_pesanan', function (Blueprint $table) {
            $table->index(['produk_id', 'pesanan_id'], 'idx_detail_pesanan_produk_pesanan');
        });

        Schema::table('pesanan', function (Blueprint $table) {
            $table->index('status', 'idx_pesanan_status');
        });
    }

    public function down(): void
    {
        Schema::table('detail_pesanan', function (Blueprint $table) {
            $table->dropIndex('idx_detail_pesanan_produk_pesanan');
        });

        Schema::table('pesanan', function (Blueprint $table) {
            $table->dropIndex('idx_pesanan_status');
        });
    }
};
