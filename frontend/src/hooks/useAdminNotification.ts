import useSWR from "swr";
import api from "@/lib/api";
import { useCallback } from "react";

export type NotificationType =
  | "order_created"
  | "payment_success"
  | "order_cancelled";

export interface AdminNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  order_id: number;
  is_read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  success: boolean;
  data: AdminNotification[];
  unread_count: number;
}

const POLL_INTERVAL = 30_000; // 30 detik

export function useAdminNotifications() {
  const { data, mutate, isLoading } = useSWR<NotificationsResponse>(
    "/admin/notifications",
    (url: string) => api.get(url).then((r) => r.data),
    {
      refreshInterval: POLL_INTERVAL,
      revalidateOnFocus: true,
    },
  );

  const notifications: AdminNotification[] = data?.data ?? [];
  const unreadCount: number = data?.unread_count ?? 0;

  const markRead = useCallback(
    async (id: number) => {
      // Optimistic update
      await mutate(
        (prev) =>
          prev
            ? {
                ...prev,
                data: prev.data.map((n) =>
                  n.id === id ? { ...n, is_read: true } : n,
                ),
                unread_count: Math.max(0, (prev.unread_count ?? 0) - 1),
              }
            : prev,
        false,
      );
      try {
        await api.patch(`/admin/notifications/${id}/read`);
      } catch {
        await mutate();
      }
    },
    [mutate],
  );

  const markAllRead = useCallback(async () => {
    await mutate(
      (prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((n) => ({ ...n, is_read: true })),
              unread_count: 0,
            }
          : prev,
      false,
    );
    try {
      await api.patch("/admin/notifications/read-all");
    } catch {
      await mutate();
    }
  }, [mutate]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    refresh: mutate,
  };
}
