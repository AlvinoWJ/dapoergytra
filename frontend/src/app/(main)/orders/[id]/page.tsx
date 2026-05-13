"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await api.get(`/pesanan/${id}`);
      if (res.data?.success) setOrder(res.data.data);
    } catch {
      router.replace("/orders");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }
    fetchOrder();
  }, [router, fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!order) return null;

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/orders")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Pesanan
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">{order.kode_pesanan}</h1>
              <p className="text-gray-500 mt-1">
                {new Date(order.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Badge
              className={`${statusInfo.color} flex items-center gap-1 w-fit border text-sm px-3 py-1`}
            >
              <StatusIcon className="h-4 w-4" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {/* Items */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold text-lg mb-4">Detail Produk</h2>
              <div className="space-y-4">
                {order.detail.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 relative">
                      <Image
                        src={item.foto}
                        alt={item.nama}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/cake_hero.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.nama}</h4>
                      <p className="text-sm text-gray-500">
                        Qty: {item.jumlah}
                      </p>
                      <p className="text-sm">
                        Rp {item.harga.toLocaleString("id-ID")} × {item.jumlah}
                      </p>
                      <p className="font-bold text-red-700">
                        = Rp{" "}
                        {(item.harga * item.jumlah).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold text-lg mb-4">
                Informasi Pengiriman
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Penerima</p>
                  <p className="font-semibold">{order.nama_penerima}</p>
                  <p className="text-gray-600">{order.no_hp}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Alamat</p>
                  <p className="text-gray-600">{order.alamat}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Pembayaran</p>
                  <p className="font-semibold">
                    {getPaymentLabel(order.metode_pembayaran)}
                  </p>
                </div>
                {order.catatan && (
                  <div>
                    <p className="text-gray-500 mb-1">Catatan</p>
                    <p className="text-gray-600">{order.catatan}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment instructions */}
          {order.status === "pending" &&
            order.metode_pembayaran === "transfer" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">
                  Informasi Pembayaran
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Silakan transfer ke salah satu rekening berikut:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <p className="font-semibold">BCA - 1234567890</p>
                    <p className="text-gray-600">a.n. dapoergytra</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-semibold">Mandiri - 0987654321</p>
                    <p className="text-gray-600">a.n. dapoergytra</p>
                  </div>
                </div>
                <p className="text-xs text-yellow-700 mt-3">
                  Cantumkan kode pesanan <strong>{order.kode_pesanan}</strong>{" "}
                  sebagai berita transfer.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
