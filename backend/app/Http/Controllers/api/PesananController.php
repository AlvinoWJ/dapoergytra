<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Keranjang;
use App\Models\Pesanan;
use App\Models\DetailPesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PesananController extends Controller
{
    /* ────────────────────────────────────────────
     | GET /api/pesanan
     | Semua pesanan milik user yang sedang login
     * ──────────────────────────────────────────── */
    public function index(Request $request): JsonResponse
    {
        $pesanan = Pesanan::with('detail')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $pesanan,
        ]);
    }

    /* ────────────────────────────────────────────
     | GET /api/pesanan/{id}
     | Detail satu pesanan (harus milik user)
     * ──────────────────────────────────────────── */
    public function show(Request $request, int $id): JsonResponse
    {
        $pesanan = Pesanan::with('detail')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $pesanan,
        ]);
    }

    /* ────────────────────────────────────────────
     | POST /api/checkout
     | Buat pesanan baru dari isi keranjang
     * ──────────────────────────────────────────── */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_penerima'    => 'required|string|max:100',
            'no_hp'            => ['required', 'string', 'regex:/^0[0-9]{8,12}$/'],
            'alamat'           => 'required|string',
            'catatan'          => 'nullable|string|max:500',
            'metode_pembayaran' => ['required', Rule::in(['transfer', 'ewallet', 'cod'])],
        ], [
            'no_hp.regex' => 'Format nomor telepon tidak valid.',
        ]);

        $user = $request->user();

        // Ambil keranjang user beserta produk
        $keranjang = Keranjang::with('detailKeranjang.produk')
            ->where('user_id', $user->id)
            ->first();

        $items = $keranjang?->detailKeranjang ?? collect();

        if ($items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang Anda kosong.',
            ], 422);
        }

        // Validasi stok semua item sebelum proses
        foreach ($items as $item) {
            $produk = $item->produk;
            if (!$produk || $produk->stok < $item->jumlah) {
                return response()->json([
                    'success' => false,
                    'message' => "Stok produk \"{$produk?->nama}\" tidak mencukupi.",
                ], 422);
            }
        }

        $ongkir   = 15000;
        $subtotal = $items->sum(fn($i) => $i->produk->harga * $i->jumlah);
        $total    = $subtotal + $ongkir;

        DB::beginTransaction();
        try {
            // 1. Buat pesanan
            $pesanan = Pesanan::create([
                'user_id'           => $user->id,
                'kode_pesanan'      => Pesanan::generateKode(),
                'status'            => 'pending',
                'nama_penerima'     => $validated['nama_penerima'],
                'no_hp'             => $validated['no_hp'],
                'alamat'            => $validated['alamat'],
                'catatan'           => $validated['catatan'] ?? null,
                'metode_pembayaran' => $validated['metode_pembayaran'],
                'subtotal'          => $subtotal,
                'ongkir'            => $ongkir,
                'total'             => $total,
            ]);

            // 2. Buat detail pesanan & kurangi stok
            foreach ($items as $item) {
                $produk = $item->produk;

                DetailPesanan::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id'  => $produk->id,
                    'nama'       => $produk->nama,
                    'harga'      => $produk->harga,
                    'foto'       => $produk->foto,
                    'jumlah'     => $item->jumlah,
                ]);

                // Kurangi stok produk
                $produk->decrement('stok', $item->jumlah);
            }

            // 3. Kosongkan keranjang
            $items->each->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat.',
                'data'    => $pesanan->load('detail'),
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses pesanan.',
            ], 500);
        }
    }

    /* ────────────────────────────────────────────
     | PATCH /api/pesanan/{id}/status   (admin only)
     | Update status pesanan
     * ──────────────────────────────────────────── */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([
                'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
            ])],
        ]);

        $pesanan = Pesanan::findOrFail($id);

        // Jika dibatalkan, kembalikan stok
        if ($validated['status'] === 'cancelled' && $pesanan->status !== 'cancelled') {
            DB::transaction(function () use ($pesanan, $validated) {
                foreach ($pesanan->detail as $item) {
                    $item->produk?->increment('stok', $item->jumlah);
                }
                $pesanan->update(['status' => $validated['status']]);
            });
        } else {
            $pesanan->update(['status' => $validated['status']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan diperbarui.',
            'data'    => $pesanan->fresh('detail'),
        ]);
    }

    /* ────────────────────────────────────────────
     | GET /api/admin/pesanan   (admin only)
     | Semua pesanan untuk dashboard admin
     * ──────────────────────────────────────────── */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Pesanan::with(['detail', 'user'])
            ->latest();

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search kode pesanan atau nama user
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_pesanan', 'like', "%{$search}%")
                  ->orWhere('nama_penerima', 'like', "%{$search}%");
            });
        }

        $pesanan = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => $pesanan,
        ]);
    }
}
