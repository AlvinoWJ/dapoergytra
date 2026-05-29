"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { fotoUrl } from "@/lib/foto";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/toast/toastprovider";
import api from "@/lib/api";

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

interface Order {
  id: number;
  status: OrderStatus;
  status_label: string;
  nama_penerima: string;
  no_hp: string;
  alamat: string;
  catatan?: string | null;
  metode_pembayaran: "transfer" | "ewallet" | "cod";
  subtotal: number;
  ongkir: number;
  total: number;
  created_at: string;
  paid_at?: string | null;
  detail: OrderItem[];
  xendit_invoice_url?: string | null;
  xendit_status?: string | null;
  xendit_expires_at?: string | null;
}

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

// const PAYMENT_LABEL: Record<string, string> = {
//   transfer: "Transfer Bank",
//   ewallet: "E-Wallet",
//   cod: "COD (Bayar di Tempat)",
// };

function getStatusConfig(status: OrderStatus): StatusConfig {
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
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isInvoiceActive(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) > new Date();
}

function OrderSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="flex justify-between mb-4">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-44 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-36 bg-gray-200 rounded-full" />
        </div>
        <Separator className="my-4" />
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-1/4 bg-gray-100 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/pesanan");
      if (res.data?.success) {
        const raw = res.data.data;
        const list: Order[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : [];
        setOrders(list);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
    fetchOrders();
  }, [router, fetchOrders]);

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (orderId) {
      show(
        "Pesanan Anda sedang diverifikasi. Status akan diperbarui otomatis.",
        "info",
      );
    }
  }, [searchParams]);

  const handleCancel = async (orderId: number) => {
    if (!confirm("Batalkan pesanan ini?")) return;
    setCancelling(orderId);
    try {
      const res = await api.patch(`/pesanan/${orderId}/cancel`);
      if (res.data?.success) {
        show("Pesanan berhasil dibatalkan.", "success");
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "dibatalkan" } : o,
          ),
        );
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal membatalkan pesanan.";
      show(msg, "error");
    } finally {
      setCancelling(null);
    }
  };

  const isLoading = !ready || loading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Pesanan Saya</h1>
              <p className="text-gray-600 mt-1">
                Pantau status dan riwayat pesanan Anda
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchOrders}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state — only show after loading is done */}
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Belum Ada Pesanan</h2>
            <p className="text-gray-600 mb-6">
              Anda belum memiliki riwayat pesanan
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-red-600 hover:bg-red-700"
            >
              Mulai Belanja
            </Button>
          </div>
        )}

        {/* Orders list — only show after loading */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const cfg = getStatusConfig(order.status);
              const StatusIcon = cfg.icon;
              const canCancel = order.status === "menunggu_pembayaran";
              const invoiceActive =
                order.status === "menunggu_pembayaran" &&
                isInvoiceActive(order.xendit_expires_at);

              return (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Pesanan #{order.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <Badge
                        className={`${cfg.badgeClass} flex items-center gap-1 w-fit border`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3 mb-4">
                      {order.detail.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 relative bg-gray-100">
                            {item.foto ? (
                              <ImageWithFallback
                                src={fotoUrl(item.foto)}
                                alt={item.nama}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                🎂
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">
                              {item.nama}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Qty: {item.jumlah}
                            </p>
                            <p className="text-sm font-bold text-red-700">
                              Rp{" "}
                              {(item.harga * item.jumlah).toLocaleString(
                                "id-ID",
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Penerima</p>
                        <p className="font-semibold">{order.nama_penerima}</p>
                        <p className="text-gray-600">{order.no_hp}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Alamat Pengiriman</p>
                        <p className="text-gray-600">{order.alamat}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Metode Pembayaran</p>
                        <p className="font-semibold flex items-center gap-1">
                          <QrCode className="h-3 w-3" />
                          QRIS
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Total Pembayaran</p>
                        <p className="text-xl font-bold text-red-700">
                          Rp {order.total.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>

                    {order.catatan && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <p className="text-gray-500 text-sm mb-1">Catatan</p>
                          <p className="text-sm text-gray-600">
                            {order.catatan}
                          </p>
                        </div>
                      </>
                    )}

                    <Separator className="my-4" />
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Ongkos kirim</span>
                        <span>Rp {order.ongkir.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base pt-1">
                        <span>Total</span>
                        <span className="text-red-700">
                          Rp {order.total.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {invoiceActive && order.xendit_invoice_url && (
                      <>
                        <Separator className="my-4" />
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <QrCode className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-yellow-800 mb-1">
                                Pembayaran Belum Selesai
                              </h4>
                              <p className="text-xs text-yellow-700 mb-3">
                                Selesaikan pembayaran QRIS sebelum{" "}
                                {order.xendit_expires_at
                                  ? formatDate(order.xendit_expires_at)
                                  : "invoice kedaluwarsa"}
                                .
                              </p>
                              <a
                                href={order.xendit_invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  size="sm"
                                  className="bg-yellow-600 hover:bg-yellow-700 gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Bayar Sekarang
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {order.status === "diproses" && order.paid_at && (
                      <>
                        <Separator className="my-4" />
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-green-800">
                              Pembayaran Berhasil
                            </p>
                            <p className="text-xs text-green-700">
                              Diterima pada {formatDate(order.paid_at)}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {canCancel && (
                      <>
                        <Separator className="my-4" />
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(order.id)}
                            loading={cancelling === order.id}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Batalkan Pesanan
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
