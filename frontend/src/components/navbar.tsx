"use client";

import { ShoppingCart, User, Menu, X, Package } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface NavbarProps {
  cartItemCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  onOrdersClick?: () => void;
  isLoggedIn: boolean;
  userName?: string;
  onLogout: () => void;
}

export function Navbar({
  cartItemCount,
  onCartClick,
  onLoginClick,
  onOrdersClick,
  isLoggedIn,
  userName,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { label: "Beranda", id: "home" },
    { label: "Produk Terbaik", id: "best-products" },
    { label: "Katalog", id: "catalog" },
    { label: "Profil", id: "about" },
  ];

  /**
   * Jika sudah di /dashboard, langsung scroll ke section.
   * Jika di halaman lain, navigate ke /dashboard dulu,
   * lalu scroll setelah halaman selesai dimuat.
   */
  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);

    const isDashboard = pathname === "/dashboard" || pathname === "/dashboard/";

    if (isDashboard) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    // Simpan section yang dituju, lalu navigate ke dashboard
    sessionStorage.setItem("scrollTarget", sectionId);
    router.push("/dashboard");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleNavClick("home")}
          >
            <h1 className="font-extrabold text-2xl text-red-600 tracking-tight">
              dapoergytra
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="text-sm font-medium text-gray-800 hover:text-red-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Orders icon — desktop only */}
            {isLoggedIn && onOrdersClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOrdersClick}
                className="hidden md:flex text-gray-700"
                title="Pesanan Saya"
              >
                <Package className="h-5 w-5" />
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className="relative text-gray-700"
            >
              <ShoppingCart className="h-6 w-6 stroke-[1.5]" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Auth — desktop */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-3 ml-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {userName}
                </span>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  Keluar
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onLoginClick}
                className="hidden md:flex"
              >
                Masuk
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-1">
              {/* Nav links */}
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  {item.label}
                </button>
              ))}

              {/* Pesanan Saya */}
              {isLoggedIn && onOrdersClick && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOrdersClick();
                  }}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Pesanan Saya
                </button>
              )}

              {/* Divider + auth */}
              <div className="border-t mt-2 pt-3 px-3">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 font-medium">
                        {userName}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                    >
                      Keluar
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLoginClick();
                    }}
                    className="w-full"
                  >
                    Masuk
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
