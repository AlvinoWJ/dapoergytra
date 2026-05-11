"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export function useCart() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);

  const requireAuth = useCallback((): boolean => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return false;
    }
    return true;
  }, [router]);

  const addItem = useCallback(
    (product: Omit<CartItem, "quantity">, quantity = 1): boolean => {
      if (!requireAuth()) return false;

      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }
        return [...prev, { ...product, quantity }];
      });
      return true;
    },
    [requireAuth],
  );

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i,
      ),
    );
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
