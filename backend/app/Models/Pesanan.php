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
    ];

    protected $casts = [
        'subtotal' => 'integer',
        'ongkir'   => 'integer',
        'total'    => 'integer',
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

    /** Label status dalam Bahasa Indonesia */
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
}
