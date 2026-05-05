"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProductCatalog } from "@/components/product_catalog";
import { About } from "@/components/about";
import { BestProducts } from "@/components/best_product";
// import { ProductCard } from "@/components/ProductCard"; // Asumsi dipisah ke komponen sendiri
// import { CartDrawer } from "@/components/CartDrawer";

interface User {
  id: number;
  name: string;
  email: string;
}

export interface Kategori {
  id: number;
  nama_kategori: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string; // Mengganti emoji dengan URL gambar asli nantinnya
  rating?: number;
  reviews_count?: number;
}

export default function HomePage() {
  const router = useRouter();

  // --- UI States ---
  const [cartOpen, setCartOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Semua");

  // --- Data States (Akan diisi dari API) ---
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]); // Sebaiknya ambil dari state management/API
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- Logic Auth & Initial Data ---
  useEffect(() => {
    // Check token untuk status login
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // TODO: Fetch User Profile & Products from Laravel API
    // fetchProducts();
    // if (token) fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    router.refresh();
  };

  // --- Cart Logic (Persiapan Integrasi API) ---
  const handleAddToCart = (product: Product) => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    // TODO: POST request ke API Laravel /api/cart
    console.log("Add to cart:", product.id);
    setCartOpen(true);
  };

  // Filter sederhana untuk UI (nantinya bisa dilakukan via query params API)
  const filteredProducts =
    activeCategory === "Semua"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* ── NAVBAR ── */}
      <Navbar
        cartItemCount={cartItemCount}
        onCartClick={() => setCartOpen(true)}
        onLoginClick={() => router.push("/login")}
        isLoggedIn={isLoggedIn}
        userName={user?.name || "User"}
        onLogout={handleLogout}
      />

      <Hero />
      <BestProducts onAddToCart={handleAddToCart} />
      <ProductCatalog onAddToCart={handleAddToCart} />
      <About />

      <Footer />
      {/* ── OVERLAYS ── */}
      {/* <CartDrawer 
        open={cartOpen} 
        onClose={() => setCartOpen(false)}  */}
      {/* // items={cartItems} */}
      {/* /> */}
      {/* <LoginModal 
        open={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      /> */}
    </div>
  );
}
