"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import api from "@/lib/api";

export interface CartItem {
  id: number;
  detail_id?: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CART_KEY = "/keranjang";

function isLoggedIn() {
  return typeof window !== "undefined" && !!localStorage.getItem("token");
}

export function useCart() {
  const router = useRouter();

  const { data, isLoading, mutate } = useSWR<{
    success: boolean;
    data: CartItem[];
  }>(
    isLoggedIn() ? CART_KEY : null, // null = tidak fetch jika belum login
    (url: string) => api.get(url).then((r) => r.data),
    { revalidateOnFocus: false },
  );

  const items: CartItem[] = data?.data ?? [];

  const addItem = useCallback(
    async (
      product: Omit<CartItem, "quantity" | "detail_id">,
      quantity = 1,
    ): Promise<boolean> => {
      if (!isLoggedIn()) {
        router.push("/login");
        return false;
      }
      try {
        await api.post("/keranjang", {
          produk_id: product.id,
          jumlah: quantity,
        });
        await mutate();
        return true;
      } catch {
        return false;
      }
    },
    [router, mutate],
  );

  const updateQuantity = useCallback(
    async (id: number, quantity: number) => {
      const item = items.find((i) => i.id === id);
      if (!item?.detail_id) return;

      await mutate(
        {
          success: true,
          data: items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i,
          ),
        },
        false,
      );

      try {
        await api.patch(`/keranjang/${item.detail_id}`, {
          jumlah: Math.max(1, quantity),
        });
      } catch {
        await mutate();
      }
    },
    [items, mutate],
  );

  const removeItem = useCallback(
    async (id: number) => {
      const item = items.find((i) => i.id === id);
      if (!item?.detail_id) return;

      await mutate(
        { success: true, data: items.filter((i) => i.id !== id) },
        false,
      );

      try {
        await api.delete(`/keranjang/${item.detail_id}`);
      } catch {
        await mutate();
      }
    },
    [items, mutate],
  );

  const clearCart = useCallback(async () => {
    await mutate({ success: true, data: [] }, false);
    try {
      await api.delete("/keranjang/clear");
    } catch {
      await mutate();
    }
  }, [mutate]);

  const fetchCart = useCallback(() => mutate(), [mutate]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    loading: isLoading,
    totalItems,
    totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
  };
}
