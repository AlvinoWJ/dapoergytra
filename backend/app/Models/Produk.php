<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produk extends Model
{
    protected $table = 'produk';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nama_produk',
        'harga',
        'deskripsi',
        'foto',
        'stok',
        'kategori_id',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'stok'  => 'integer',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    public function getFotoUrlAttribute(): ?string
    {
        if (!$this->foto) return null;
        if (str_starts_with($this->foto, 'http')) return $this->foto;
        return asset('storage/' . $this->foto);
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
    }

    // public function detailPesanans(): HasMany
    // {
    //     return $this->hasMany(DetailPesanan::class, 'id_produk', 'id_produk');
    // }

    // public function detailKeranjangs(): HasMany
    // {
    //     return $this->hasMany(DetailKeranjang::class, 'id_produk', 'id_produk');
    // }
}
