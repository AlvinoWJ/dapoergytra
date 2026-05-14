"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
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
  detail: OrderItem[];
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

const PAYMENT_LABEL: Record<string, string> = {
  transfer: "Transfer Bank",
  ewallet: "E-Wallet",
  cod: "COD (Bayar di Tempat)",
};

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
  const { show } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/pesanan");
      if (res.data?.success) {
        setOrders(res.data.data);
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
    setIsLoggedIn(true);
    fetchOrders();
  }, [router, fetchOrders]);

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

  if (!isLoggedIn) return null;

  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="space-y-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)
            : orders.map((order) => {
                const cfg = getStatusConfig(order.status);
                const StatusIcon = cfg.icon;
                const canCancel = order.status === "menunggu_pembayaran";

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
                                <Image
                                  src={item.foto}
                                  alt={item.nama}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/cake_hero.jpg";
                                  }}
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
                          <p className="text-gray-500 mb-1">
                            Alamat Pengiriman
                          </p>
                          <p className="text-gray-600">{order.alamat}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">
                            Metode Pembayaran
                          </p>
                          <p className="font-semibold">
                            {PAYMENT_LABEL[order.metode_pembayaran] ??
                              order.metode_pembayaran}
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
                            <p className="text-gray-500 text-sm mb-1">
                              Catatan
                            </p>
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
                          <span>
                            Rp {order.subtotal.toLocaleString("id-ID")}
                          </span>
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

                      {order.status === "menunggu_pembayaran" &&
                        order.metode_pembayaran === "transfer" && (
                          <>
                            <Separator className="my-4" />
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <h4 className="font-semibold text-sm mb-2">
                                Informasi Pembayaran
                              </h4>
                              <p className="text-sm text-gray-700 mb-3">
                                Silakan transfer ke salah satu rekening berikut:
                              </p>
                              <div className="space-y-2 text-sm">
                                <div className="bg-white p-2 rounded border">
                                  <p className="font-semibold">
                                    BCA – 1234567890
                                  </p>
                                  <p className="text-gray-600">
                                    a.n. dapoergytra
                                  </p>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                  <p className="font-semibold">
                                    Mandiri – 0987654321
                                  </p>
                                  <p className="text-gray-600">
                                    a.n. dapoergytra
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-yellow-700 mt-3">
                                Cantumkan nomor pesanan{" "}
                                <strong>#{order.id}</strong> sebagai berita
                                transfer.
                              </p>
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
      </div>
    </div>
  );
}
