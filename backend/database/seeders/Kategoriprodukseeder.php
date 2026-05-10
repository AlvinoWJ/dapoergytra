<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kategori;
use App\Models\Produk;

class KategoriProdukSeeder extends Seeder
{
    public function run(): void
    {
        $kategoris = [
            ['nama' => 'Brownies'],
            ['nama' => 'Tradisional'],
            ['nama' => 'Cake'],
            ['nama' => 'Tart'],
        ];

        foreach ($kategoris as $k) {
            Kategori::firstOrCreate(['nama' => $k['nama']]);
        }

        $brownies   = Kategori::where('nama', 'Brownies')->first();
        $tradisional = Kategori::where('nama', 'Tradisional')->first();
        $cake       = Kategori::where('nama', 'Cake')->first();
        $tart       = Kategori::where('nama', 'Tart')->first();

        $products = [
            // Brownies
            [
                'nama'        => 'Brownies Coklat Premium',
                'harga'       => 75000,
                'deskripsi'   => 'Brownies coklat dengan tekstur lembut dan rasa coklat yang kaya',
                'foto'        => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop',
                'stok'        => 50,
                'kategori_id' => $brownies->id,
            ],
            [
                'nama'        => 'Brownies Keju',
                'harga'       => 80000,
                'deskripsi'   => 'Perpaduan sempurna brownies coklat dengan topping keju melimpah',
                'foto'        => 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&h=400&fit=crop',
                'stok'        => 40,
                'kategori_id' => $brownies->id,
            ],
            [
                'nama'        => 'Brownies Matcha',
                'harga'       => 85000,
                'deskripsi'   => 'Brownies dengan sentuhan matcha Jepang premium',
                'foto'        => 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop',
                'stok'        => 30,
                'kategori_id' => $brownies->id,
            ],
            // Tradisional
            [
                'nama'        => 'Kue Lapis Legit',
                'harga'       => 120000,
                'deskripsi'   => 'Lapis legit original dengan 18 lapis yang lembut',
                'foto'        => 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop',
                'stok'        => 20,
                'kategori_id' => $tradisional->id,
            ],
            [
                'nama'        => 'Bika Ambon',
                'harga'       => 55000,
                'deskripsi'   => 'Bika ambon khas dengan tekstur bersarang',
                'foto'        => 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&h=400&fit=crop',
                'stok'        => 35,
                'kategori_id' => $tradisional->id,
            ],
            [
                'nama'        => 'Kue Putu Ayu',
                'harga'       => 45000,
                'deskripsi'   => 'Kue putu ayu lembut dengan kelapa parut segar',
                'foto'        => 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=400&h=400&fit=crop',
                'stok'        => 60,
                'kategori_id' => $tradisional->id,
            ],
            // Cake
            [
                'nama'        => 'Red Velvet Cake',
                'harga'       => 95000,
                'deskripsi'   => 'Red velvet dengan cream cheese frosting yang creamy',
                'foto'        => 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=400&fit=crop',
                'stok'        => 25,
                'kategori_id' => $cake->id,
            ],
            [
                'nama'        => 'Tiramisu Cake',
                'harga'       => 110000,
                'deskripsi'   => 'Tiramisu klasik Italia dengan kopi pilihan',
                'foto'        => 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop',
                'stok'        => 20,
                'kategori_id' => $cake->id,
            ],
            [
                'nama'        => 'Rainbow Cake',
                'harga'       => 100000,
                'deskripsi'   => 'Cake berlapis warna-warni yang cantik dan lezat',
                'foto'        => 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&h=400&fit=crop',
                'stok'        => 15,
                'kategori_id' => $cake->id,
            ],
            // Tart
            [
                'nama'        => 'Fruit Tart',
                'harga'       => 125000,
                'deskripsi'   => 'Tart dengan topping buah segar dan custard cream',
                'foto'        => 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=400&h=400&fit=crop',
                'stok'        => 18,
                'kategori_id' => $tart->id,
            ],
            [
                'nama'        => 'Cheese Tart',
                'harga'       => 90000,
                'deskripsi'   => 'Tart keju Jepang dengan tekstur lembut dan creamy',
                'foto'        => 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop',
                'stok'        => 22,
                'kategori_id' => $tart->id,
            ],
            [
                'nama'        => 'Chocolate Tart',
                'harga'       => 95000,
                'deskripsi'   => 'Tart coklat premium dengan ganache yang kaya',
                'foto'        => 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop',
                'stok'        => 20,
                'kategori_id' => $tart->id,
            ],
        ];

        foreach ($products as $p) {
            Produk::firstOrCreate(
                ['nama' => $p['nama']],
                $p
            );
        }
    }
}
