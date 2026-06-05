<?php

namespace Database\Seeders;

use App\Models\Produk;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DownloadProdukFotoSeeder extends Seeder
{
    public function run(): void
    {
        $produkList = Produk::all();

        foreach ($produkList as $produk) {
            // Skip jika foto sudah local
            if ($produk->foto && !str_starts_with($produk->foto, 'http')) {
                $this->command->info("Skip #{$produk->id} {$produk->nama} (sudah lokal)");
                continue;
            }

            if (!$produk->foto) {
                $this->command->warn("Skip #{$produk->id} {$produk->nama} (tidak ada foto)");
                continue;
            }

            try {
                $this->command->info("Download #{$produk->id} {$produk->nama}...");

                $response = Http::timeout(30)->get($produk->foto);

                if (!$response->successful()) {
                    $this->command->error("Gagal download: HTTP {$response->status()}");
                    continue;
                }

                $ext      = 'jpg';
                $filename = 'produk_' . $produk->id . '_' . Str::random(6) . '.' . $ext;
                $path     = 'produk/' . $filename;

                Storage::disk('public')->put($path, $response->body());

                $produk->update(['foto' => $path]);

                $this->command->info("  → Tersimpan: {$path}");

            } catch (\Throwable $e) {
                $this->command->error("Error #{$produk->id}: " . $e->getMessage());
            }
        }

        $this->command->info('Selesai!');
    }
}
