<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    protected $table = 'admin_notification';

    protected $fillable = [
        'type',
        'title',
        'message',
        'order_id',
        'is_read',
    ];

    protected $casts = [
        'is_read'    => 'boolean',
        'order_id'   => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];


    public static function createForOrder(Pesanan $pesanan, string $type): self
    {
        $config = [
            'order_created' => [
                'title'   => 'Pesanan Baru',
                'message' => "Pesanan #{$pesanan->id} telah dibuat.",
            ],
            'payment_success' => [
                'title'   => 'Pembayaran Berhasil',
                'message' => "Pesanan #{$pesanan->id} telah berhasil dibayar.",
            ],
            'order_cancelled' => [
                'title'   => 'Pesanan Dibatalkan',
                'message' => "Pesanan #{$pesanan->id} telah dibatalkan.",
            ],
        ];

        $data = $config[$type] ?? [
            'title'   => 'Notifikasi Pesanan',
            'message' => "Ada pembaruan pada pesanan #{$pesanan->id}.",
        ];

        return self::create([
            'type'     => $type,
            'title'    => $data['title'],
            'message'  => $data['message'],
            'order_id' => $pesanan->id,
        ]);
    }
}
