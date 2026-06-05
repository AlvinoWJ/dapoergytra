// frontend/src/app/admin/orders/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  QrCode,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  OrderDetailModal,
  Order,
  OrderStatus,
  getStatusCfg,
  formatDate,
} from "@/components/order_detail_modal";
import api from "@/lib/api";
import { useConfirmModal } from "@/hooks/useConfirmationModal";
import ConfirmationModal from "@/components/confirmation_modal";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua Status" },
  { value: "menunggu_pembayaran", label: "Menunggu Pembayaran" },
  { value: "diproses", label: "Diproses" },
  { value: "dikirim", label: "Dikirim" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

const NEXT_STATUS: Partial<
  Record<OrderStatus, { status: OrderStatus; label: string; className: string }>
> = {
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

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const {
    modal,
    loading: confirmLoading,
    confirm,
    close,
    handleConfirm,
  } = useConfirmModal();

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

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

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

  const handleCancelOrder = (order: Order) => {
    confirm({
      title: "Batalkan Pesanan",
      message: `Pesanan atas nama "${order.nama_penerima}" akan dibatalkan dan stok semua produk di dalamnya akan dikembalikan.`,
      detail: `Pesanan #${order.id} · Rp ${order.total.toLocaleString("id-ID")}`,
      type: "warning",
      confirmText: "Ya, Batalkan",
      onConfirm: async () => {
        await handleUpdateStatus(order.id, "dibatalkan");
      },
    });
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

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
        <div className="flex flex-col">
          <div className="flex ">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Cari nama, telepon, email..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
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

                      {nextStep && order.status !== "menunggu_pembayaran" && (
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
                        order.status !== "selesai" &&
                        order.status !== "menunggu_pembayaran" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            disabled={updating === order.id || confirmLoading}
                            onClick={() => handleCancelOrder(order)}
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
      />

      <ConfirmationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        detail={modal.detail}
        type={modal.type}
        confirmText={modal.confirmText}
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onCancel={close}
      />
    </div>
  );
}
