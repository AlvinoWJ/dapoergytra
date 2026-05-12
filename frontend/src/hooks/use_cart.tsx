// frontend/src/hooks/use_cart.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export interface CartItem {
  id: number;
  detail_id?: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export function useCart() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = () =>
    typeof window !== "undefined" && !!localStorage.getItem("token");

  /** Muat keranjang dari server */
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      setLoading(true);
      const res = await api.get("/keranjang");
      if (res.data?.success) setItems(res.data.data);
    } catch {
      // abaikan error (misal 401 sudah dihandle interceptor)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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
        const res = await api.post("/keranjang", {
          produk_id: product.id,
          jumlah: quantity,
        });
        if (res.data?.success) {
          await fetchCart();
        }
        return true;
      } catch {
        return false;
      }
    },
    [router, fetchCart],
  );

  const updateQuantity = useCallback(
    async (id: number, quantity: number) => {
      const item = items.find((i) => i.id === id);
      if (!item?.detail_id) return;
      try {
        await api.patch(`/keranjang/${item.detail_id}`, {
          jumlah: Math.max(1, quantity),
        });
        setItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i,
          ),
        );
      } catch {}
    },
    [items],
  );

  const removeItem = useCallback(
    async (id: number) => {
      const item = items.find((i) => i.id === id);
      if (!item?.detail_id) return;
      try {
        await api.delete(`/keranjang/${item.detail_id}`);
        setItems((prev) => prev.filter((i) => i.id !== id));
      } catch {}
    },
    [items],
  );

  const clearCart = useCallback(async () => {
    try {
      await api.delete("/keranjang/clear");
      setItems([]);
    } catch {}
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    loading,
    totalItems,
    totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
  };
}
