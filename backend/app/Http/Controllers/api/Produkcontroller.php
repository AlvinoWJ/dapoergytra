<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProdukController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Produk::with('kategori');

        // Filter by kategori
        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }

        // Filter by kategori name (slug-friendly)
        if ($request->filled('kategori')) {
            $query->whereHas('kategori', function ($q) use ($request) {
                $q->where('nama', 'like', '%' . $request->kategori . '%');
            });
        }

        // Search by name
        if ($request->filled('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortBy  = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['nama', 'harga', 'stok', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $produks = $query->paginate($request->input('per_page', 12));

        return response()->json([
            'success' => true,
            'data'    => $produks,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama'        => ['required', 'string', 'max:200'],
            'harga'       => ['required', 'numeric', 'min:0'],
            'deskripsi'   => ['nullable', 'string'],
            'foto'        => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'stok'        => ['required', 'integer', 'min:0'],
            'kategori_id' => ['required', 'exists:kategori,id'],
        ]);

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('produks', 'public');
            $validated['foto'] = $path;
        }

        $produk = Produk::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan.',
            'data'    => $produk->load('kategori'),
        ], 201);
    }

    public function show(Produk $produk): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $produk->load('kategori'),
        ]);
    }

    public function update(Request $request, Produk $produk): JsonResponse
    {
        $validated = $request->validate([
            'nama'        => ['sometimes', 'required', 'string', 'max:200'],
            'harga'       => ['sometimes', 'required', 'numeric', 'min:0'],
            'deskripsi'   => ['nullable', 'string'],
            'foto'        => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'stok'        => ['sometimes', 'required', 'integer', 'min:0'],
            'kategori_id' => ['sometimes', 'required', 'exists:kategori,id'],
        ]);

        if ($request->hasFile('foto')) {
            // Delete old foto from storage (skip if it's an external URL)
            if ($produk->foto && !str_starts_with($produk->foto, 'http')) {
                Storage::disk('public')->delete($produk->foto);
            }
            $path = $request->file('foto')->store('produks', 'public');
            $validated['foto'] = $path;
        }

        $produk->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diperbarui.',
            'data'    => $produk->load('kategori'),
        ]);
    }

    public function destroy(Produk $produk): JsonResponse
    {
        if ($produk->foto && !str_starts_with($produk->foto, 'http')) {
            Storage::disk('public')->delete($produk->foto);
        }

        $produk->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus.',
        ]);
    }

    /**
     * Get best sellers (top N by order count)
     */
    public function bestSellers(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 3);

        $produks = Produk::with('kategori')
            ->withCount('detailPesanans as total_terjual')
            ->orderByDesc('total_terjual')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $produks,
        ]);
    }
}
