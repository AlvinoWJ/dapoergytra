"use client";

import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { fotoUrl } from "@/lib/foto";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ── Types ── */
export type OrderStatus =
  | "menunggu_pembayaran"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export interface OrderItem {
  id: number;
  produk_id: number;
  nama: string;
  harga: number;
  foto: string | null;
  jumlah: number;
}

export interface OrderUser {
  id: number;
  username: string;
  email: string;
}

export interface Order {
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

type StatusConfig = {
  label: string;
  badgeClass: string;
  icon: React.ElementType;
};

export const STATUS_MAP: Record<OrderStatus, StatusConfig> = {
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

export function getStatusCfg(status: OrderStatus): StatusConfig {
  return (
    STATUS_MAP[status] ?? {
      label: status,
      badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
      icon: Package,
    }
  );
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Props ── */
interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

/* ── Component ── */
export function OrderDetailModal({
  order,
  open,
  onClose,
}: OrderDetailModalProps) {
  if (!order) return null;

  const cfg = getStatusCfg(order.status);
  const StatusIcon = cfg.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pesanan #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status & waktu */}
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

          {/* Data pelanggan */}
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

          {/* Item pesanan */}
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
                        className="w-full h-full object-cover"
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

          {/* Rincian harga */}
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

          {/* Xendit invoice link — hanya saat menunggu bayar */}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
