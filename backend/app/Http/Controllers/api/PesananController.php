<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\AdminNotification;

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
     * GET /api/admin/pesanan
     * Semua pesanan dari semua user — khusus admin.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Pesanan::with(['details.produk', 'user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $pesanan = $query
            ->latest()
            ->paginate($request->input('per_page', 20));

        $pesanan->through(fn($p) => $this->formatPesananAdmin($p));

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
            $pesanan->update([
                'status'        => 'dibatalkan',
                'xendit_status' => 'CANCELLED',
            ]);
            AdminNotification::createForOrder($pesanan, 'order_cancelled');
        });

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan.',
            'data'    => $this->formatPesanan($pesanan->fresh('details.produk')),
        ]);
    }

    /**
     * PATCH /api/admin/pesanan/{id}/status
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
                AdminNotification::createForOrder($pesanan, 'order_cancelled');
            });
        } else {
            $pesanan->update(['status' => $validated['status']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui.',
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
            'paid_at'            => $pesanan->paid_at,
            'xendit_status'      => $pesanan->xendit_status,
            'xendit_invoice_url' => $pesanan->xendit_invoice_url,
            'xendit_expires_at'  => $pesanan->xendit_expires_at,
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

    private function formatPesananAdmin(Pesanan $pesanan): array
    {
        $data = $this->formatPesanan($pesanan);
        $data['user'] = $pesanan->user ? [
            'id'       => $pesanan->user->id,
            'username' => $pesanan->user->username,
            'email'    => $pesanan->user->email,
        ] : null;
        return $data;
    }
}
