// frontend/src/app/admin/orders/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { fotoUrl } from "@/lib/foto";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";

/* ── Types ── */
type OrderStatus =
  | "menunggu_pembayaran"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

interface OrderItem {
  id: number;
  produk_id: number;
  nama: string;
  harga: number;
  foto: string | null;
  jumlah: number;
}

interface OrderUser {
  id: number;
  username: string;
  email: string;
}

interface Order {
  id: number;
  status: OrderStatus;
  status_label: string;
  nama_penerima: string;
  no_hp: string;
  alamat: string;
  catatan?: string | null;
  metode_pembayaran: string;
  subtotal: number;
  ongkir: number;
  total: number;
  created_at: string;
  paid_at?: string | null;
  detail: OrderItem[];
  user?: OrderUser;
  xendit_invoice_url?: string | null;
  xendit_status?: string | null;
  xendit_expires_at?: string | null;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

/* ── Status config ── */
type StatusConfig = {
  label: string;
  badgeClass: string;
  icon: React.ElementType;
};

const STATUS_MAP: Record<OrderStatus, StatusConfig> = {
  menunggu_pembayaran: {
    label: "Menunggu Pembayaran",
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

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua Status" },
  { value: "menunggu_pembayaran", label: "Menunggu Pembayaran" },
  { value: "diproses", label: "Diproses" },
  { value: "dikirim", label: "Dikirim" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

// Next status transitions
const NEXT_STATUS: Partial<
  Record<OrderStatus, { status: OrderStatus; label: string; className: string }>
> = {
  menunggu_pembayaran: {
    status: "diproses",
    label: "Konfirmasi & Proses",
    className: "bg-purple-600 hover:bg-purple-700 text-white",
  },
  diproses: {
    status: "dikirim",
    label: "Kirim Pesanan",
    className: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
  dikirim: {
    status: "selesai",
    label: "Tandai Selesai",
    className: "bg-green-600 hover:bg-green-700 text-white",
  },
};

function getStatusCfg(status: OrderStatus): StatusConfig {
  return (
    STATUS_MAP[status] ?? {
      label: status,
      badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
      icon: Package,
    }
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Skeleton ── */
function OrderSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="flex justify-between mb-4">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-32 bg-gray-200 rounded-full" />
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between items-center">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-32 bg-gray-200 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Detail Modal ── */
function OrderDetailModal({
  order,
  open,
  onClose,
  onUpdateStatus,
  updating,
}: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (id: number, status: OrderStatus) => void;
  updating: number | null;
}) {
  if (!order) return null;
  const cfg = getStatusCfg(order.status);
  const StatusIcon = cfg.icon;
  const nextStep = NEXT_STATUS[order.status];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pesanan #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status & info */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {formatDate(order.created_at)}
              </p>
              {order.paid_at && (
                <p className="text-xs text-green-600 mt-0.5">
                  Dibayar: {formatDate(order.paid_at)}
                </p>
              )}
            </div>
            <Badge
              className={`${cfg.badgeClass} flex items-center gap-1 border`}
            >
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </Badge>
          </div>

          <Separator />

          {/* Customer */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-gray-700 uppercase tracking-wide">
              Data Pelanggan
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nama</span>
                <span className="font-medium">{order.nama_penerima}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Telepon</span>
                <span className="font-medium">{order.no_hp}</span>
              </div>
              {order.user && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Akun</span>
                  <span className="font-medium text-blue-600">
                    {order.user.email}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Alamat</span>
                <span className="font-medium text-right max-w-[60%]">
                  {order.alamat}
                </span>
              </div>
              {order.catatan && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Catatan</span>
                  <span className="font-medium text-right max-w-[60%] italic">
                    {order.catatan}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-gray-700 uppercase tracking-wide">
              Item Pesanan
            </h3>
            <div className="space-y-2">
              {order.detail.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 relative bg-gray-200">
                    {item.foto ? (
                      <ImageWithFallback
                        src={fotoUrl(item.foto)}
                        alt={item.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        🎂
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{item.nama}</p>
                    <p className="text-xs text-gray-500">Qty: {item.jumlah}</p>
                    <p className="text-sm font-bold text-red-700">
                      Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Ongkir</span>
              <span>Rp {order.ongkir.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t">
              <span>Total</span>
              <span className="text-red-700">
                Rp {order.total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Xendit invoice link */}
          {order.xendit_invoice_url &&
            order.status === "menunggu_pembayaran" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-yellow-700" />
                  <span className="text-sm text-yellow-800 font-medium">
                    Invoice QRIS aktif
                  </span>
                </div>
                <a
                  href={order.xendit_invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-yellow-700 underline flex items-center gap-1"
                >
                  Buka <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

          {/* Actions */}
          <div className="space-y-2 pt-1">
            <p className="text-sm font-semibold text-gray-700">
              Update Status:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                Object.entries(NEXT_STATUS) as [
                  OrderStatus,
                  (typeof NEXT_STATUS)[OrderStatus],
                ][]
              ).map(([from, next]) => {
                if (!next) return null;
                return (
                  <Button
                    key={from}
                    size="sm"
                    variant="outline"
                    disabled={updating === order.id}
                    onClick={() => {
                      onUpdateStatus(order.id, next.status);
                      onClose();
                    }}
                    className={order.status === from ? next.className : ""}
                  >
                    {next.label}
                  </Button>
                );
              })}
              {order.status !== "dibatalkan" && order.status !== "selesai" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updating === order.id}
                  onClick={() => {
                    onUpdateStatus(order.id, "dibatalkan");
                    onClose();
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Batalkan
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Page ── */
export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const params: Record<string, string | number> = { per_page: 20, page };
        if (statusFilter !== "all") params.status = statusFilter;

        const res = await api.get("/admin/pesanan", { params });
        if (res.data?.success) {
          const paginated = res.data.data;
          // Filter client-side by search (nama, no_hp, id)
          let data: Order[] = paginated.data ?? [];
          if (search.trim()) {
            const q = search.trim().toLowerCase();
            data = data.filter(
              (o) =>
                String(o.id).includes(q) ||
                o.nama_penerima.toLowerCase().includes(q) ||
                o.no_hp.includes(q) ||
                (o.user?.email.toLowerCase().includes(q) ?? false),
            );
          }
          setOrders(data);
          setPagination({
            current_page: paginated.current_page,
            last_page: paginated.last_page,
            total: paginated.total,
            per_page: paginated.per_page,
          });
        }
      } catch (err) {
        console.error(err);
        showToast("Gagal memuat data pesanan.", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, statusFilter, search],
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminAuth = localStorage.getItem("adminAuth");
    if (!token || !adminAuth) {
      router.replace("/admin/login");
      return;
    }
    fetchOrders();
  }, [router, fetchOrders]);

  // Auto-open order from URL param (?id=...)
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && orders.length > 0) {
      const found = orders.find((o) => String(o.id) === id);
      if (found) {
        setSelectedOrder(found);
        setDetailOpen(true);
      }
    }
  }, [searchParams, orders]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleUpdateStatus = async (
    orderId: number,
    newStatus: OrderStatus,
  ) => {
    setUpdating(orderId);
    try {
      const res = await api.patch(`/admin/pesanan/${orderId}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        showToast("Status pesanan berhasil diperbarui.");
        // Update local state optimistically
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  status_label: res.data.data?.status_label ?? newStatus,
                }
              : o,
          ),
        );
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal mengubah status.";
      showToast(msg, "error");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={[
            "fixed top-5 right-5 z-[9999] flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg text-sm font-medium",
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
        >
          <span>{toast.type === "success" ? "✓" : "⚠"}</span>
          {toast.msg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Heading */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Pesanan</h1>
            <p className="text-gray-500 mt-1">
              {loading ? "Memuat..." : `${pagination.total} pesanan total`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Filters */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
                placeholder="Cari nama, telepon, email..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSearch(searchInput)}
              className="rounded-xl px-4"
            >
              Cari
            </Button>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status summary badges */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.filter((o) => o.value !== "all").map((opt) => {
            const cfg = getStatusCfg(opt.value as OrderStatus);
            const Icon = cfg.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  statusFilter === opt.value
                    ? cfg.badgeClass + " border-current"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400",
                ].join(" ")}
              >
                <Icon className="h-3 w-3" />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <OrderSkeleton key={i} />)
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  Tidak ada pesanan ditemukan
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Coba ubah filter atau kata kunci pencarian.
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              const cfg = getStatusCfg(order.status);
              const StatusIcon = cfg.icon;
              const nextStep = NEXT_STATUS[order.status];
              const totalItems = order.detail.reduce((s, d) => s + d.jumlah, 0);

              return (
                <Card
                  key={order.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            Pesanan #{order.id}
                          </h3>
                          {order.xendit_status === "PAID" && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Lunas
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                        <p className="text-sm mt-0.5">
                          <span className="font-medium">
                            {order.nama_penerima}
                          </span>
                          <span className="text-gray-400 mx-1">·</span>
                          <span className="text-gray-500">{order.no_hp}</span>
                        </p>
                        {order.user && (
                          <p className="text-xs text-gray-400">
                            {order.user.email}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={`${cfg.badgeClass} flex items-center gap-1 border w-fit`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid sm:grid-cols-3 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Item</p>
                        <p className="font-semibold">{totalItems} item</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Metode Bayar</p>
                        <p className="font-semibold capitalize flex items-center gap-1">
                          <QrCode className="h-3 w-3" /> QRIS
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-bold text-red-700">
                          Rp {order.total.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDetailOpen(true);
                        }}
                      >
                        Lihat Detail
                      </Button>

                      {nextStep && (
                        <Button
                          size="sm"
                          className={`flex-1 ${nextStep.className}`}
                          disabled={updating === order.id}
                          onClick={() =>
                            handleUpdateStatus(order.id, nextStep.status)
                          }
                        >
                          {updating === order.id ? (
                            <span className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent inline-block" />
                          ) : null}
                          {nextStep.label}
                        </Button>
                      )}

                      {order.status !== "dibatalkan" &&
                        order.status !== "selesai" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            disabled={updating === order.id}
                            onClick={() =>
                              handleUpdateStatus(order.id, "dibatalkan")
                            }
                          >
                            Batalkan
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.last_page > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">
              Halaman {pagination.current_page} dari {pagination.last_page} ·{" "}
              {pagination.total} pesanan
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedOrder(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        updating={updating}
      />
    </div>
  );
}
