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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";

/* ── Types ── */
type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

interface OrderItem {
  id: number;
  produk_id: number;
  nama: string;
  harga: number;
  foto: string;
  jumlah: number;
}

interface Order {
  id: number;
  kode_pesanan: string;
  status: OrderStatus;
  nama_penerima: string;
  no_hp: string;
  alamat: string;
  catatan?: string;
  metode_pembayaran: "transfer" | "ewallet" | "cod";
  subtotal: number;
  ongkir: number;
  total: number;
  created_at: string;
  detail: OrderItem[];
}

/* ── Helpers ── */
function getStatusInfo(status: OrderStatus) {
  const map: Record<
    OrderStatus,
    { label: string; color: string; icon: React.ElementType }
  > = {
    pending: {
      label: "Menunggu Konfirmasi",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    confirmed: {
      label: "Dikonfirmasi",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CheckCircle,
    },
    processing: {
      label: "Diproses",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Package,
    },
    shipped: {
      label: "Dikirim",
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
      icon: Truck,
    },
    delivered: {
      label: "Selesai",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Dibatalkan",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
    },
  };
  return (
    map[status] ?? {
      label: status,
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: Package,
    }
  );
}

function getPaymentLabel(method: string) {
  const map: Record<string, string> = {
    transfer: "Transfer Bank",
    ewallet: "E-Wallet",
    cod: "COD (Bayar di Tempat)",
  };
  return map[method] ?? method;
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

/* ── Skeleton ── */
function OrderSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="flex justify-between mb-4">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-28 bg-gray-200 rounded-full" />
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

/* ── Main Page ── */
export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/pesanan");
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch {
      // error ditangani interceptor (401 → redirect login)
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

  if (!isLoggedIn) return null;

  /* ── Empty state ── */
  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold">Pesanan Saya</h1>
          <p className="text-gray-600 mt-2">
            Pantau status dan riwayat pesanan Anda
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)
            : orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {order.kode_pesanan}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <Badge
                          className={`${statusInfo.color} flex items-center gap-1 w-fit border`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <Separator className="my-4" />

                      {/* Order Items */}
                      <div className="space-y-3 mb-4">
                        {order.detail.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 relative">
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

                      {/* Order Details */}
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
                            {getPaymentLabel(order.metode_pembayaran)}
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

                      {/* Payment instructions for pending transfer orders */}
                      {order.status === "pending" &&
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
                                    BCA - 1234567890
                                  </p>
                                  <p className="text-gray-600">
                                    a.n. dapoergytra
                                  </p>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                  <p className="font-semibold">
                                    Mandiri - 0987654321
                                  </p>
                                  <p className="text-gray-600">
                                    a.n. dapoergytra
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-yellow-700 mt-3">
                                Cantumkan kode pesanan{" "}
                                <strong>{order.kode_pesanan}</strong> sebagai
                                berita transfer.
                              </p>
                            </div>
                          </>
                        )}

                      {/* Rincian harga */}
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
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      </div>
    </div>
  );
}
