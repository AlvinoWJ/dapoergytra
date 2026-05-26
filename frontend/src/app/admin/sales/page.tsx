// frontend/src/app/admin/sales/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { fotoUrl } from "@/lib/foto";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

/* ── Types ── */
interface SummaryData {
  total_revenue: number;
  total_orders: number;
  completed_orders: number;
  average_order_value: number;
}

interface TopProduct {
  produk_id: number;
  nama: string;
  foto: string | null;
  total_quantity: number;
  total_revenue: number;
}

interface DailyPoint {
  date: string;
  total_orders: number;
  total_revenue: number;
}

interface MonthlyPoint {
  month: string;
  total_orders: number;
  total_revenue: number;
}

function formatDateLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function formatMonthLabel(monthStr: string) {
  return new Date(monthStr + "-01").toLocaleDateString("id-ID", {
    month: "short",
    year: "2-digit",
  });
}

function StatSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-7 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Main Page ── */
export default function AdminSalesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([]);

  const fetchData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [summaryRes, topRes, dailyRes, monthlyRes] = await Promise.all([
        api.get("/admin/sales/summary"),
        api.get("/admin/sales/top-products?limit=5"),
        api.get("/admin/sales/daily?days=7"),
        api.get("/admin/sales/monthly?months=6"),
      ]);

      if (summaryRes.data?.success) setSummary(summaryRes.data.data);
      if (topRes.data?.success) setTopProducts(topRes.data.data);
      if (dailyRes.data?.success) setDaily(dailyRes.data.data);
      if (monthlyRes.data?.success) setMonthly(monthlyRes.data.data);
    } catch (err) {
      console.error("Gagal memuat data laporan:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminAuth = localStorage.getItem("adminAuth");
    if (!token || !adminAuth) {
      router.replace("/admin/login");
      return;
    }
    fetchData();
  }, [router, fetchData]);

  const statCards = summary
    ? [
        {
          title: "Total Pendapatan",
          value: `Rp ${(summary.total_revenue / 1_000_000).toFixed(1)}jt`,
          desc: "Pesanan tidak dibatalkan",
          icon: DollarSign,
          color: "text-green-600",
          iconBg: "bg-green-100",
          cardBg: "bg-green-50",
        },
        {
          title: "Total Pesanan",
          value: summary.total_orders,
          desc: `${summary.completed_orders} selesai`,
          icon: ShoppingCart,
          color: "text-blue-600",
          iconBg: "bg-blue-100",
          cardBg: "bg-blue-50",
        },
        {
          title: "Rata-rata Pesanan",
          value: `Rp ${Math.round(summary.average_order_value / 1000)}rb`,
          desc: "Per transaksi",
          icon: TrendingUp,
          color: "text-purple-600",
          iconBg: "bg-purple-100",
          cardBg: "bg-purple-50",
        },
        {
          title: "Produk Terlaris",
          value: topProducts[0]?.nama ?? "—",
          desc: topProducts[0]
            ? `${topProducts[0].total_quantity} terjual`
            : "Belum ada data",
          icon: Package,
          color: "text-red-600",
          iconBg: "bg-red-100",
          cardBg: "bg-red-50",
        },
      ]
    : [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Laporan Penjualan
          </h1>
          <p className="text-gray-500 mt-1">
            Rekap dan analisis penjualan dapoergytra
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          title="Refresh"
        >
          <RefreshCw
            className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <Card
                  key={i}
                  className={`${s.cardBg} border-none hover:shadow-lg transition-shadow`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {s.title}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 truncate">
                          {s.value}
                        </h3>
                        <p className="text-xs text-gray-500">{s.desc}</p>
                      </div>
                      <div
                        className={`${s.iconBg} p-2.5 rounded-lg flex-shrink-0 ml-2`}
                      >
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue line chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Pendapatan 7 Hari Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-52 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={daily.map((d) => ({
                    label: formatDateLabel(d.date),
                    revenue: Math.round(d.total_revenue / 1000),
                    orders: d.total_orders,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(v: unknown) => [
                      `Rp ${((v as number) * 1000).toLocaleString("id-ID")}`,
                      "Pendapatan",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#dc2626"
                    strokeWidth={2.5}
                    dot={{ fill: "#dc2626", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Jumlah Pesanan per Bulan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-52 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={monthly.map((m) => ({
                    label: formatMonthLabel(m.month),
                    orders: m.total_orders,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(v: unknown) => [v, "Pesanan"]}
                  />
                  <Bar dataKey="orders" fill="#dc2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly revenue bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pendapatan Bulanan (dalam ribu Rp)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-52 bg-gray-100 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={monthly.map((m) => ({
                  label: formatMonthLabel(m.month),
                  revenue: Math.round(m.total_revenue / 1000),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(v: unknown) => [
                    `Rp ${((v as number) * 1000).toLocaleString("id-ID")}`,
                    "Pendapatan",
                  ]}
                />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-gray-100 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">Belum ada data penjualan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.produk_id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                    <ImageWithFallback
                      src={fotoUrl(product.foto)}
                      alt={product.nama}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {product.nama}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.total_quantity} terjual
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-red-700">
                      Rp {product.total_revenue.toLocaleString("id-ID")}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-0.5">
                      #{index + 1} terlaris
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily sales table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Rincian Penjualan 7 Hari Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 animate-pulse rounded"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">
                      Tanggal
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">
                      Pesanan
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">
                      Pendapatan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((day, i) => (
                    <tr
                      key={i}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-3 text-gray-700">{day.date}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-medium">{day.total_orders}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-red-700">
                        Rp {day.total_revenue.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
