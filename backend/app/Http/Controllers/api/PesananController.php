<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PesananController extends Controller
{
    /**
     * GET /api/pesanan
     * Semua pesanan milik user yang sedang login
     */
    public function index(Request $request): JsonResponse
    {
        $pesanan = Pesanan::with(['details.produk'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn($p) => $this->formatPesanan($p));

        return response()->json([
            'success' => true,
            'data'    => $pesanan,
        ]);
    }

    /**
     * GET /api/pesanan/{id}
     * Detail satu pesanan (harus milik user yang login)
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $pesanan = Pesanan::with(['details.produk'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $this->formatPesanan($pesanan),
        ]);
    }

    /**
     * PATCH /api/pesanan/{id}/cancel
     * User membatalkan pesanan (hanya saat menunggu_pembayaran)
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
            foreach ($pesanan->details as $detail) {
                $detail->produk?->increment('stok', $detail->jumlah);
            }
            $pesanan->update(['status' => 'dibatalkan']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan.',
            'data'    => $this->formatPesanan($pesanan->fresh('details.produk')),
        ]);
    }

    /**
     * Format satu pesanan untuk response JSON,
     * termasuk detail item dengan data produk inline.
     */
    private function formatPesanan(Pesanan $pesanan): array
    {
        return [
            'id'                 => $pesanan->id,
            'status'             => $pesanan->status,
            'status_label'       => $pesanan->status_label,
            'nama_penerima'      => $pesanan->nama_penerima,
            'no_hp'              => $pesanan->no_hp,
            'alamat'             => $pesanan->alamat,
            'catatan'            => $pesanan->catatan,
            'metode_pembayaran'  => $pesanan->metode_pembayaran,
            'subtotal'           => (int) $pesanan->subtotal,
            'ongkir'             => (int) $pesanan->ongkir,
            'total'              => (int) $pesanan->total,
            'created_at'         => $pesanan->created_at,
            'detail'             => $pesanan->details->map(function ($d) {
                return [
                    'id'        => $d->id,
                    'produk_id' => $d->produk_id,
                    'nama'      => $d->produk?->nama ?? '-',
                    'harga'     => (int) ($d->harga_satuan ?? $d->produk?->harga ?? 0),
                    'foto'      => $d->produk?->foto ?? null,
                    'jumlah'    => $d->jumlah,
                ];
            })->values(),
        ];
    }
}
