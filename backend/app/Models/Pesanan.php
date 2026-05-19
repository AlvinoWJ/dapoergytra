<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Pesanan extends Model
{
    use HasFactory;

    protected $table = 'pesanan';

    protected $fillable = [
        'user_id',
        'nama_penerima',
        'no_hp',
        'alamat',
        'catatan',
        'metode_pembayaran',
        'subtotal',
        'ongkir',
        'total',
        'status',
        'xendit_invoice_id',
        'xendit_invoice_url',
        'xendit_status',
        'xendit_payment_method',
        'xendit_expires_at',
        'paid_at',
    ];

    protected $casts = [
        'subtotal' => 'integer',
        'ongkir'   => 'integer',
        'total'    => 'integer',
        'xendit_expires_at'  => 'datetime',
        'paid_at'            => 'datetime',
    ];

    /* ── Relations ── */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function details()
    {
        return $this->hasMany(DetailPesanan::class);
    }

    /* ── Helpers ── */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'menunggu_pembayaran' => 'Menunggu Pembayaran',
            'diproses'            => 'Diproses',
            'dikirim'             => 'Dikirim',
            'selesai'             => 'Selesai',
            'dibatalkan'          => 'Dibatalkan',
            default               => ucfirst($this->status),
        };
    }

    public function isInvoiceActive(): bool
    {
        if (! $this->xendit_invoice_url) return false;
        if (! $this->xendit_expires_at) return true;
        return $this->xendit_expires_at->isFuture();
    }
}
