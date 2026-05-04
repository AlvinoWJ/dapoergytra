import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface NavbarProps {
  cartItemCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  isLoggedIn: boolean;
  userName?: string;
  onLogout: () => void;
}

export function Navbar({
  cartItemCount,
  onCartClick,
  onLoginClick,
  isLoggedIn,
  userName,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {" "}
          {/* Tinggi sedikit ditambah agar elegan */}
          {/* Logo - Bold dan Merah Sesuai Gambar */}
          <div className="flex-shrink-0 cursor-pointer">
            <h1 className="font-extrabold text-2xl text-red-600 tracking-tight">
              dapoergytra
            </h1>
          </div>
          {/* Desktop Navigation - Warna Hitam & Jarak Lebih Lebar */}
          <div className="hidden md:flex items-center gap-10">
            {["Beranda", "Produk Terbaik", "Katalog", "Profil"].map((item) => (
              <button
                key={item}
                className="text-sm font-medium text-gray-800 hover:text-red-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Icon - Ghost Style */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className="relative text-gray-700"
            >
              <ShoppingCart className="h-6 w-6 stroke-[1.5]" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* Auth Button - Rounded Full & Red */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-3 ml-2">
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

            {/* Mobile Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
