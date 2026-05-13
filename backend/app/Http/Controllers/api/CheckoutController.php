<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetailKeranjang;
use App\Models\DetailPesanan;
use App\Models\Keranjang;
use App\Models\Pesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        // Ambil keranjang beserta detail dan produk
        $keranjang = Keranjang::with('details.produk')
            ->where('user_id', $user->id)
            ->first();

        if (! $keranjang || $keranjang->details->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang Anda kosong.',
            ], 422);
        }

        // Validasi stok semua produk sebelum membuat pesanan
        foreach ($keranjang->details as $detail) {
            if (! $detail->produk) {
                return response()->json([
                    'success' => false,
                    'message' => "Produk tidak ditemukan.",
                ], 422);
            }

            if ($detail->produk->stok < $detail->jumlah) {
                return response()->json([
                    'success' => false,
                    'message' => "Stok produk \"{$detail->produk->nama}\" tidak mencukupi (tersisa {$detail->produk->stok}).",
                ], 422);
            }
        }

        $ongkir = 15000;

        try {
            $pesanan = DB::transaction(function () use ($validated, $user, $keranjang, $ongkir) {

                // Hitung subtotal
                $subtotal = $keranjang->details->sum(
                    fn ($d) => $d->produk->harga * $d->jumlah
                );

                // Buat pesanan
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

                // Buat detail pesanan & kurangi stok
                foreach ($keranjang->details as $detail) {
                    $produk = $detail->produk;

                    DetailPesanan::create([
                        'pesanan_id'   => $pesanan->id,
                        'produk_id'    => $produk->id,
                        'jumlah'       => $detail->jumlah,
                        'harga_satuan' => $produk->harga,
                        'subtotal'     => $produk->harga * $detail->jumlah,
                    ]);

                    // Kurangi stok produk
                    $produk->decrement('stok', $detail->jumlah);
                }

                // Kosongkan keranjang
                $keranjang->details()->delete();

                return $pesanan;
            });

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat.',
                'data'    => $pesanan->load('details.produk'),
            ], 201);

        } catch (\Throwable $e) {
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

    /**
     * GET /api/orders/{id}
     *
     * Detail satu pesanan (hanya milik user yang login).
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $pesanan = Pesanan::with('details.produk')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => array_merge($pesanan->toArray(), [
                'status_label' => $pesanan->status_label,
            ]),
        ]);
    }

    /**
     * PATCH /api/orders/{id}/cancel
     *
     * User membatalkan pesanan (hanya bisa saat status menunggu_pembayaran).
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $pesanan = Pesanan::with('details.produk')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        if ($pesanan->status !== 'menunggu_pembayaran') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dibatalkan karena sudah diproses.',
            ], 422);
        }

        DB::transaction(function () use ($pesanan) {
            // Kembalikan stok
            foreach ($pesanan->details as $detail) {
                if ($detail->produk) {
                    $detail->produk->increment('stok', $detail->jumlah);
                }
            }

            $pesanan->update(['status' => 'dibatalkan']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan.',
            'data'    => $pesanan->fresh(),
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
