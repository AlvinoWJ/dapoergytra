<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use App\Models\DetailPesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesReportController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $baseQuery = Pesanan::whereNotIn('status', ['dibatalkan']);

        $totalRevenue   = $baseQuery->clone()->sum('total');
        $totalOrders    = Pesanan::count();
        $completedOrders = Pesanan::where('status', 'selesai')->count();
        $paidCount      = $baseQuery->clone()->count();
        $avgOrderValue  = $paidCount > 0 ? $totalRevenue / $paidCount : 0;

        return response()->json([
            'success' => true,
            'data'    => [
                'total_revenue'       => (int) $totalRevenue,
                'total_orders'        => $totalOrders,
                'completed_orders'    => $completedOrders,
                'average_order_value' => (int) $avgOrderValue,
            ],
        ]);
    }

    public function topProducts(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 5);

        $products = DetailPesanan::select(
                'detail_pesanan.produk_id',
                DB::raw('SUM(detail_pesanan.jumlah) as total_quantity'),
                DB::raw('SUM(detail_pesanan.subtotal) as total_revenue')
            )
            ->join('pesanan', 'detail_pesanan.pesanan_id', '=', 'pesanan.id')
            ->join('produk', 'detail_pesanan.produk_id', '=', 'produk.id')
            ->whereNotIn('pesanan.status', ['dibatalkan'])
            ->groupBy('detail_pesanan.produk_id')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->with('produk:id,nama,foto')
            ->get()
            ->map(fn($d) => [
                'produk_id'      => $d->produk_id,
                'nama'           => $d->produk?->nama ?? '—',
                'foto'           => $d->produk?->foto ?? null,
                'total_quantity' => (int) $d->total_quantity,
                'total_revenue'  => (int) $d->total_revenue,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $products,
        ]);
    }

    public function dailySales(Request $request): JsonResponse
    {
        $days = (int) $request->input('days', 7);

        $results = Pesanan::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total) as total_revenue')
            )
            ->whereNotIn('status', ['dibatalkan'])
            ->where('created_at', '>=', now()->subDays($days - 1)->startOfDay())
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $list = collect(range(0, $days - 1))->map(function ($i) use ($results, $days) {
            $d   = now()->subDays(($days - 1) - $i)->toDateString();
            $row = $results->get($d);
            return [
                'date'          => $d,
                'total_orders'  => $row ? (int) $row->total_orders : 0,
                'total_revenue' => $row ? (int) $row->total_revenue : 0,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $list->values(),
        ]);
    }

    public function monthlySales(Request $request): JsonResponse
    {
        $months = (int) $request->input('months', 6);

        $results = Pesanan::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total) as total_revenue')
            )
            ->whereNotIn('status', ['dibatalkan'])
            ->where('created_at', '>=', now()->subMonths($months - 1)->startOfMonth())
            ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'))
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        // Pastikan semua bulan terisi
        $months_list = collect(range(0, $months - 1))->map(function ($i) use ($results, $months) {
            $key = now()->subMonths(($months - 1) - $i)->format('Y-m');
            $row = $results->get($key);
            return [
                'month'         => $key,
                'total_orders'  => $row ? (int) $row->total_orders : 0,
                'total_revenue' => $row ? (int) $row->total_revenue : 0,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $months_list->values(),
        ]);
    }
}
