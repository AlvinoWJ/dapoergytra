<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
         Schema::create('pesanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('nama_penerima');
            $table->string('no_hp', 20);
            $table->text('alamat');
            $table->text('catatan')->nullable();

            $table->enum('metode_pembayaran', ['transfer', 'ewallet', 'cod'])
                  ->default('transfer');

            $table->unsignedBigInteger('subtotal')->default(0);
            $table->unsignedBigInteger('ongkir')->default(15000);
            $table->unsignedBigInteger('total')->default(0);

            $table->enum('status', [
                'menunggu_pembayaran',
                'diproses',
                'dikirim',
                'selesai',
                'dibatalkan',
            ])->default('menunggu_pembayaran');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pesanan');
    }
};
