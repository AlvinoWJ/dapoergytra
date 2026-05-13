"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useCartContext } from "./cart/cart_provider";
import { useToast } from "@/components/toast/toastprovider";
import { Footer } from "./footer";

interface User {
  id: number;
  name: string;
  email: string;
}

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { show } = useToast();
  const { totalItems } = useCartContext();

  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    // TODO: if (token) fetchUserProfile().then(setUser)
  }, []);

  const handleCartClick = () => {
    if (!localStorage.getItem("token")) {
      show("Silakan masuk terlebih dahulu.", "warning");
      router.push("/login");
      return;
    }
    router.push("/cart");
  };

  const handleOrdersClick = () => {
    if (!localStorage.getItem("token")) {
      show("Silakan masuk terlebih dahulu.", "warning");
      router.push("/login");
      return;
    }
    router.push("/orders");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    router.refresh();
  };

  return (
    <>
      <Navbar
        cartItemCount={totalItems}
        onCartClick={handleCartClick}
        onOrdersClick={handleOrdersClick}
        onLoginClick={() => router.push("/login")}
        isLoggedIn={isLoggedIn}
        userName={user?.name || "User"}
        onLogout={handleLogout}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
