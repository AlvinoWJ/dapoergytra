"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/hero";
import { ProductCatalog } from "@/components/product_catalog";
import { About } from "@/components/about";
import { BestProducts } from "@/components/product_best";
import { ProductDetailModal } from "@/components/product_detail";
import { useCartContext } from "@/components/cart/cart_provider";
import { useToast } from "@/components/toast/toastprovider";

interface User {
  id: number;
  name: string;
  email: string;
}

export interface Kategori {
  id: number;
  nama: string;
}

interface Produk {
  id: number;
  nama: string;
  kategori?: Kategori;
  harga: number;
  deskripsi: string;
  foto: string;
  rating?: number;
  reviews_count?: number;
}

export default function HomePage() {
  const router = useRouter();
  const { show } = useToast();
  const { totalItems, addItem } = useCartContext();

  // --- UI States ---
  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  // const [cartOpen, setCartOpen] = useState(false);
  // const [loginModalOpen, setLoginModalOpen] = useState(false);
  // const [activeCategory, setActiveCategory] = useState("Semua");

  // --- Data States (Akan diisi dari API) ---
  // const [Produk, setProduk] = useState<Produk[]>([]);
  // const [user, setUser] = useState<User | null>(null);
  // const [cartItems, setCartItems] = useState<any[]>([]);

  const requireAuth = (): boolean => {
    if (!localStorage.getItem("token")) {
      show("Silakan masuk terlebih dahulu.", "warning");
      router.push("/login");
      return false;
    }
    return true;
  };

  const handleAddToCart = (product: Produk) => {
    if (!requireAuth()) return;

    addItem({
      id: product.id,
      name: product.nama,
      price: product.harga,
      image: product.foto,
    });
    show(`${product.nama} ditambahkan ke keranjang.`, "success");
  };

  const handleAddToCartWithQuantity = (produk: Produk, quantity = 1) => {
    if (!requireAuth()) return;

    addItem(
      {
        id: produk.id,
        name: produk.nama,
        price: produk.harga,
        image: produk.foto,
      },
      quantity,
    );
    show(`${produk.nama} (×${quantity}) ditambahkan ke keranjang.`, "success");
  };

  const openProductDetail = (produk: Produk) => {
    setSelectedProduk(produk);
    setDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Hero />

      <BestProducts
        onAddToCart={handleAddToCart}
        onProductClick={openProductDetail}
      />

      <ProductCatalog
        onAddToCart={handleAddToCart}
        onProductClick={openProductDetail}
      />

      <About />

      <ProductDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
        }}
        Produk={selectedProduk}
        onAddToCart={handleAddToCartWithQuantity}
      />

      {/* <Cart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          setCartOpen(false);
          router.push("/cart");
        }}
      /> */}
    </div>
  );
}
