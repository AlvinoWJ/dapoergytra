<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kategori extends Model
{
    protected $fillable = [
        'nama',
    ];

    protected $hidden = [
    'created_at',
    'updated_at',
    ];

    public function produks(): HasMany
    {
        return $this->hasMany(Produk::class);
    }
}
