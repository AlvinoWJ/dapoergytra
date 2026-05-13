<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetailKeranjang;
use App\Models\Keranjang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KeranjangController extends Controller
{

    private function getOrCreateKeranjang(): Keranjang
    {
        return Keranjang::firstOrCreate(['user_id' => Auth::id()]);
    }

    /**
     * GET /api/keranjang
     * Mengembalikan isi keranjang beserta detail produk
     */
    public function index()
    {
        $keranjang = $this->getOrCreateKeranjang();
        $keranjang->load('details.produk');

        $items = $keranjang->details->map(function ($detail) {
            return [
                'detail_id' => $detail->id,
                'id'        => $detail->produk_id,
                'name'      => $detail->produk->nama,
                'price'     => $detail->produk->harga,
                'image'     => $detail->produk->foto,
                'quantity'  => $detail->jumlah,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    /**
     * POST /api/keranjang
     * Body: { id_produk, jumlah }
     * Tambah produk atau update jumlah jika sudah ada
     */
    public function store(Request $request)
    {
        $request->validate([
            'produk_id' => 'required|exists:produk,id',
            'jumlah'    => 'required|integer|min:1',
        ]);

        $keranjang = $this->getOrCreateKeranjang();

        $detail = DetailKeranjang::where('keranjang_id', $keranjang->id)
            ->where('produk_id', $request->produk_id)
            ->first();

        if ($detail) {
            $detail->increment('jumlah', $request->jumlah);
        } else {
            $detail = DetailKeranjang::create([
                'keranjang_id' => $keranjang->id,
                'produk_id'    => $request->produk_id,
                'jumlah'       => $request->jumlah,
            ]);
        }

        $detail->load('produk');

        return response()->json([
            'success' => true,
            'message' => 'Produk ditambahkan ke keranjang.',
            'data'    => [
                'detail_id' => $detail->id,
                'produk_id' => $detail->produk_id,
                'name'      => $detail->produk->nama,
                'price'     => $detail->produk->harga,
                'image'     => $detail->produk->foto,
                'quantity'  => $detail->jumlah,
            ],
        ], 201);
    }

    /**
     * PATCH /api/keranjang/{id_detail}
     * Body: { jumlah }
     * Update jumlah item tertentu
     */
    public function update(Request $request, int $detail_id)
    {
        $request->validate([
            'jumlah' => 'required|integer|min:1',
        ]);

        $keranjang = $this->getOrCreateKeranjang();

        $detail = DetailKeranjang::where('id', $detail_id)
            ->where('keranjang_id', $keranjang->id)
            ->firstOrFail();

        $detail->update(['jumlah' => $request->jumlah]);

        return response()->json([
            'success' => true,
            'message' => 'Jumlah diperbarui.',
            'data'    => ['detail_id' => $detail->id, 'jumlah' => $detail->jumlah],
        ]);
    }

    /**
     * DELETE /api/keranjang/{id_detail}
     * Hapus satu item dari keranjang
     */
    public function destroy(int $detail_id)
    {
        $keranjang = $this->getOrCreateKeranjang();

        $detail = DetailKeranjang::where('id', $detail_id)
            ->where('keranjang_id', $keranjang->id)
            ->firstOrFail();

        $detail->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item dihapus dari keranjang.',
        ]);
    }

    /**
     * DELETE /api/keranjang
     * Kosongkan seluruh keranjang
     */
    public function clear()
    {
        $keranjang = $this->getOrCreateKeranjang();
        $keranjang->details()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Keranjang dikosongkan.',
        ]);
    }
}
