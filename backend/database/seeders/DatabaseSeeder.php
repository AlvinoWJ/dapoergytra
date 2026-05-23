<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->create([
            'username' => 'admin',
            'email' => 'admin@dapoergytra.com',
            'password' => 'Admin123',
            'role' => 'admin',
        ]);

        $this->call(KategoriProdukSeeder::class);
    }
}
