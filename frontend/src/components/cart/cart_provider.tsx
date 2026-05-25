"use client";

import { createContext, useContext, useMemo } from "react";
import { useCart } from "@/hooks/use_cart";

type CartContextType = ReturnType<typeof useCart>;
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();

  const value = useMemo(
    () => cart,
    [
      cart.items,
      cart.loading,
      cart.totalItems,
      cart.totalPrice,
      cart.addItem,
      cart.updateQuantity,
      cart.removeItem,
      cart.clearCart,
      cart.fetchCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext harus di dalam <CartProvider>");
  return ctx;
}
