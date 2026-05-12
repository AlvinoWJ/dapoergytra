"use client";

import { createContext, useContext } from "react";
import { useCart } from "@/hooks/use_cart";

type CartContextType = ReturnType<typeof useCart>;
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext harus di dalam <CartProvider>");
  return ctx;
}
