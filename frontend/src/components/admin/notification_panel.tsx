"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Check,
  Package,
} from "lucide-react";
import {
  AdminNotification,
  NotificationType,
  useAdminNotifications,
} from "@/hooks/useAdminNotification";

const TYPE_CONFIG: Record<
  NotificationType,
  {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    dotColor: string;
  }
> = {
  order_created: {
    icon: ShoppingCart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    dotColor: "bg-blue-500",
  },
  payment_success: {
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    dotColor: "bg-green-500",
  },
  order_cancelled: {
    icon: XCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    dotColor: "bg-red-500",
  },
};

/* ── Relative time ── */
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

interface NotificationItemProps {
  notification: AdminNotification;
  onRead: (id: number) => void;
  onNavigate: (orderId: number) => void;
}

function NotificationItem({
  notification,
  onRead,
  onNavigate,
}: NotificationItemProps) {
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG["order_created"];
  const Icon = cfg.icon;

  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id);
    onNavigate(notification.order_id);
  };

  return (
    <div
      className={[
        "flex gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 cursor-pointer group",
        !notification.is_read ? "bg-blue-50/40" : "",
      ].join(" ")}
      onClick={handleClick}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${cfg.iconBg}`}
      >
        <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug ${
              notification.is_read
                ? "text-gray-600"
                : "font-semibold text-gray-900"
            }`}
          >
            {notification.message}
          </p>

          {!notification.is_read && (
            <span
              className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${cfg.dotColor}`}
            />
          )}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-gray-400">
            {relativeTime(notification.created_at)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!notification.is_read) onRead(notification.id);
              onNavigate(notification.order_id);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Lihat Pesanan →
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationPanel() {
  const router = useRouter();
  const { notifications, unreadCount, isLoading, markRead, markAllRead } =
    useAdminNotifications();

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleNavigate = (orderId: number) => {
    setOpen(false);
    router.push(`/admin/pesanan?search=${orderId}`);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-gray-900">
                Notifikasi
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Check className="h-3 w-3" />
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3.5 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Package className="h-10 w-10 mb-3 text-gray-200" />
                <p className="text-sm font-medium">Belum ada notifikasi</p>
                <p className="text-xs mt-1">
                  Notifikasi akan muncul saat ada aktivitas pesanan.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markRead}
                  onNavigate={handleNavigate}
                />
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/admin/pesanan");
                }}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium w-full text-center transition-colors"
              >
                Lihat Semua Pesanan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
