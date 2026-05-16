<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Keranjang;
use App\Models\Produk;
use App\Models\Pesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    /**
     * POST /api/checkout
     *
     * Membuat pesanan baru dari isi keranjang user yang sedang login.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_penerima'    => ['required', 'string', 'max:255'],
            'no_hp'            => ['required', 'string', 'max:20', 'regex:/^0[0-9]{8,12}$/'],
            'alamat'           => ['required', 'string'],
            'catatan'          => ['nullable', 'string'],
            'metode_pembayaran'=> ['required', 'in:transfer,ewallet,cod'],
        ], [
            'nama_penerima.required'     => 'Nama penerima wajib diisi.',
            'no_hp.required'             => 'Nomor telepon wajib diisi.',
            'no_hp.regex'                => 'Format nomor telepon tidak valid.',
            'alamat.required'            => 'Alamat lengkap wajib diisi.',
            'metode_pembayaran.required' => 'Metode pembayaran wajib dipilih.',
            'metode_pembayaran.in'       => 'Metode pembayaran tidak valid.',
        ]);

        $user = $request->user();

        // Ambil keranjang
        $keranjang = Keranjang::with('details')
            ->where('user_id', $user->id)
            ->first();

        if (! $keranjang || $keranjang->details->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang Anda kosong.',
            ], 422);
        }

        $produkid = $keranjang->details->pluck('produk_id')->all();

        $ongkir = 15000;

        try {
            $pesanan = DB::transaction(function () use ($validated, $user, $keranjang, $produkid, $ongkir) {

            $produkLocked = Produk::whereIn('id', $produkid)
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                foreach ($keranjang->details as $detail) {
                    $produk = $produkLocked->get($detail->produk_id);

                    if (! $produk) {
                        throw new \RuntimeException(
                            "Produk ID {$detail->produk_id} tidak ditemukan."
                        );
                    }

                    if ($produk->stok < $detail->jumlah) {
                        throw new \RuntimeException(
                            "Stok produk \"{$produk->nama}\" tidak mencukupi"
                            . " (tersisa {$produk->stok})."
                        );
                    }
                }

                $subtotal   = 0;
                $detailData = [];
                $now        = now();

                foreach ($keranjang->details as $detail) {
                    $produk        = $produkLocked->get($detail->produk_id);
                    $hargaSatuan   = (int) $produk->harga;
                    $subtotalBaris = $hargaSatuan * $detail->jumlah;
                    $subtotal     += $subtotalBaris;

                    $detailData[] = [
                        'produk_id'    => $detail->produk_id,
                        'jumlah'       => $detail->jumlah,
                        'harga_satuan' => $hargaSatuan,
                        'subtotal'     => $subtotalBaris,
                        'created_at'   => $now,
                        'updated_at'   => $now,
                    ];
                }

                $pesanan = Pesanan::create([
                    'user_id'           => $user->id,
                    'nama_penerima'     => $validated['nama_penerima'],
                    'no_hp'             => $validated['no_hp'],
                    'alamat'            => $validated['alamat'],
                    'catatan'           => $validated['catatan'] ?? null,
                    'metode_pembayaran' => $validated['metode_pembayaran'],
                    'subtotal'          => $subtotal,
                    'ongkir'            => $ongkir,
                    'total'             => $subtotal + $ongkir,
                    'status'            => 'menunggu_pembayaran',
                ]);

                $pesanan->details()->createMany($detailData);

                foreach ($keranjang->details as $detail) {
                    $produkLocked->get($detail->produk_id)
                        ->decrement('stok', $detail->jumlah);
                }

                $keranjang->details()->delete();

                return $pesanan;
            });

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat.',
                'data'    => $pesanan->load('details.produk'),
            ], 201);

        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);

        } catch (\Throwable $e) {
            Log::error('Checkout gagal', [
                'user_id' => $user->id,
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pesanan. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * GET /api/orders
     *
     * Daftar pesanan milik user yang sedang login.
     */
    public function index(Request $request): JsonResponse
    {
        $pesanan = Pesanan::with('details.produk')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $pesanan,
        ]);
    }

    /* ── Admin only ── */

    /**
     * PATCH /api/admin/orders/{id}/status
     *
     * Admin mengubah status pesanan.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:menunggu_pembayaran,diproses,dikirim,selesai,dibatalkan'],
        ]);

        $pesanan = Pesanan::with('details.produk')->findOrFail($id);

        // Jika admin membatalkan, kembalikan stok
        if ($validated['status'] === 'dibatalkan' && $pesanan->status !== 'dibatalkan') {
            DB::transaction(function () use ($pesanan, $validated) {
                foreach ($pesanan->details as $detail) {
                    if ($detail->produk) {
                        $detail->produk->increment('stok', $detail->jumlah);
                    }
                }
                $pesanan->update(['status' => $validated['status']]);
            });
        } else {
            $pesanan->update(['status' => $validated['status']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui.',
            'data'    => $pesanan->fresh(),
        ]);
    }
}
