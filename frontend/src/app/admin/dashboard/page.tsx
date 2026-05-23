"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

/* ── Types ── */
type OrderStatus =
  | "menunggu_pembayaran"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

interface RecentOrder {
  id: number;
  nama_penerima: string;
  total: number;
  status: OrderStatus;
  created_at: string;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  processedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
}

interface ChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface PieSlice {
  name: string;
  value: number;
  color: string;
}

/* ── Status config ── */
const STATUS_MAP: Record<
  OrderStatus,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  menunggu_pembayaran: {
    label: "Menunggu Bayar",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  diproses: {
    label: "Diproses",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Package,
  },
  dikirim: {
    label: "Dikirim",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: Truck,
  },
  selesai: {
    label: "Selesai",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  dibatalkan: {
    label: "Dibatalkan",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

function getStatusCfg(status: OrderStatus) {
  return (
    STATUS_MAP[status] ?? {
      label: status,
      badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
      icon: Package,
    }
  );
}

/* ── Skeleton ── */
function StatSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Main Component ── */
export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueData, setRevenueData] = useState<ChartPoint[]>([]);
  const [statusData, setStatusData] = useState<PieSlice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      /* ── Fetch all data in parallel ── */
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get("/admin/pesanan?per_page=100"),
        api.get("/produk?per_page=1"),
        api
          .get("/admin/users?per_page=1")
          .catch(() => ({ data: { total: 0 } })),
      ]);

      const allOrders: RecentOrder[] =
        ordersRes.data?.data?.data ?? ordersRes.data?.data ?? [];
      const totalProducts: number =
        productsRes.data?.data?.total ?? productsRes.data?.total ?? 0;
      const totalCustomers: number =
        usersRes.data?.total ?? usersRes.data?.data?.total ?? 0;

      /* ── Stats ── */
      const countByStatus = (s: OrderStatus) =>
        allOrders.filter((o) => o.status === s).length;

      const totalRevenue = allOrders
        .filter((o) => o.status !== "dibatalkan")
        .reduce((sum, o) => sum + o.total, 0);

      setStats({
        totalOrders: allOrders.length,
        pendingOrders: countByStatus("menunggu_pembayaran"),
        processedOrders: countByStatus("diproses"),
        completedOrders: countByStatus("selesai"),
        cancelledOrders: countByStatus("dibatalkan"),
        totalRevenue,
        totalProducts,
        totalCustomers,
      });

      /* ── Recent orders (latest 5) ── */
      const sorted = [...allOrders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setRecentOrders(sorted.slice(0, 5));

      /* ── Revenue chart (last 7 days) ── */
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
      });

      const chartData: ChartPoint[] = days.map((date) => {
        const dayOrders = allOrders.filter(
          (o) =>
            new Date(o.created_at).toISOString().split("T")[0] === date &&
            o.status !== "dibatalkan",
        );
        return {
          date: new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          revenue: Math.round(
            dayOrders.reduce((s, o) => s + o.total, 0) / 1000,
          ),
          orders: dayOrders.length,
        };
      });
      setRevenueData(chartData);

      /* ── Pie chart ── */
      const PIE_COLORS: Record<OrderStatus, string> = {
        menunggu_pembayaran: "#eab308",
        diproses: "#a855f7",
        dikirim: "#6366f1",
        selesai: "#22c55e",
        dibatalkan: "#ef4444",
      };
      const pie: PieSlice[] = (
        Object.entries(PIE_COLORS) as [OrderStatus, string][]
      )
        .map(([status, color]) => ({
          name: getStatusCfg(status).label,
          value: countByStatus(status),
          color,
        }))
        .filter((s) => s.value > 0);
      setStatusData(pie);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
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
    fetchDashboard();
  }, [router, fetchDashboard]);

  /* ── Stat cards config ── */
  const statCards = stats
    ? [
        {
          title: "Total Pendapatan",
          value: `Rp ${(stats.totalRevenue / 1_000_000).toFixed(1)}jt`,
          icon: DollarSign,
          color: "text-green-600",
          bg: "bg-green-50",
          iconBg: "bg-green-100",
          desc: "Pesanan tidak dibatalkan",
          change: null as number | null,
        },
        {
          title: "Total Pesanan",
          value: stats.totalOrders,
          icon: ShoppingCart,
          color: "text-blue-600",
          bg: "bg-blue-50",
          iconBg: "bg-blue-100",
          desc: `${stats.cancelledOrders} dibatalkan`,
          change: null,
        },
        {
          title: "Menunggu Bayar",
          value: stats.pendingOrders,
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          iconBg: "bg-yellow-100",
          desc: "Perlu tindakan",
          change: null,
        },
        {
          title: "Pesanan Selesai",
          value: stats.completedOrders,
          icon: CheckCircle,
          color: "text-purple-600",
          bg: "bg-purple-50",
          iconBg: "bg-purple-100",
          desc: `${stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}% dari total`,
          change: null,
        },
      ]
    : [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang kembali, Admin!</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={i}
                  className={`${stat.bg} border-none hover:shadow-lg transition-shadow duration-300 cursor-default group`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {stat.title}
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                          {stat.value}
                        </h3>
                        <div className="flex items-center gap-2">
                          {stat.change !== null && stat.change !== 0 && (
                            <div
                              className={`flex items-center gap-1 text-xs font-medium ${stat.change > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {stat.change > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {Math.abs(stat.change).toFixed(1)}%
                            </div>
                          )}
                          <p className="text-xs text-gray-500">{stat.desc}</p>
                        </div>
                      </div>
                      <div
                        className={`${stat.iconBg} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue line chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Tren Pendapatan (7 Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: unknown) => [
                      `Rp ${((value as number) * 1000).toLocaleString("id-ID")}`,
                      "Pendapatan",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#dc2626"
                    strokeWidth={3}
                    dot={{ fill: "#dc2626", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribusi Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />
            ) : statusData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
                Belum ada data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent > 0.05
                        ? `${name}: ${(percent * 100).toFixed(0)}%`
                        : ""
                    }
                    outerRadius={90}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Jumlah Pesanan (7 Hari Terakhir)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[250px] bg-gray-100 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: unknown) => [value, "Pesanan"]}
                />
                <Bar dataKey="orders" fill="#dc2626" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent orders table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pesanan Terbaru</CardTitle>
          <button
            onClick={() => router.push("/admin/orders")}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Lihat Semua →
          </button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 animate-pulse rounded"
                />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Belum ada pesanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {["ID", "Pelanggan", "Total", "Status", "Tanggal"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 font-semibold text-sm text-gray-700"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const cfg = getStatusCfg(order.status);
                    const StatusIcon = cfg.icon;
                    return (
                      <tr
                        key={order.id}
                        className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/admin/orders?id=${order.id}`)
                        }
                      >
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            #{order.id}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-700">
                            {order.nama_penerima}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-semibold text-gray-900">
                            Rp {order.total.toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={`${cfg.badgeClass} flex items-center gap-1 w-fit border`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Kelola Pesanan",
            href: "/admin/orders",
            icon: ShoppingCart,
            color: "text-blue-600",
            bg: "bg-blue-50 hover:bg-blue-100",
          },
          {
            label: "Kelola Produk",
            href: "/admin/products",
            icon: Package,
            color: "text-green-600",
            bg: "bg-green-50 hover:bg-green-100",
          },
          {
            label: "Pelanggan",
            href: "/admin/users",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50 hover:bg-purple-100",
          },
          {
            label: "Lihat Toko",
            href: "/dashboard",
            icon: TrendingUp,
            color: "text-red-600",
            bg: "bg-red-50 hover:bg-red-100",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`${item.bg} rounded-xl p-4 flex flex-col items-center gap-2 transition-colors group`}
            >
              <Icon
                className={`h-6 w-6 ${item.color} group-hover:scale-110 transition-transform`}
              />
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
