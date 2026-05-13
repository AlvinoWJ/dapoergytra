import { ShoppingCart, User, Menu, X, Package } from "lucide-react";
import { useState } from "react";
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

  const menuItems = [
    { label: "Beranda", id: "home" },
    { label: "Produk Terbaik", id: "best-products" },
    { label: "Katalog", id: "catalog" },
    { label: "Profil", id: "about" },
  ];

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
          <div className="flex-shrink-0 cursor-pointer">
            <h1 className="font-extrabold text-2xl text-red-600 tracking-tight">
              dapoergytra
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-gray-800 hover:text-red-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isLoggedIn && onOrdersClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOrdersClick}
                className="hidden md:flex text-gray-700"
              >
                <Package className="h-5 w-5" />
              </Button>
            )}

            {/* Cart Icon - Ghost Style */}
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
