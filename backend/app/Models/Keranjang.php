<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Keranjang extends Model
{
    protected $fillable = ['user_id'];

    public function details()
    {
        return $this->hasMany(DetailKeranjang::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
