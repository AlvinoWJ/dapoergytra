"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminTopBarProps {
  onLogout: () => void;
  collapsed: boolean;
}

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/produk": "Kelola Produk",
  "/admin/pesanan": "Kelola Pesanan",
  "/admin/users": "Data Pelanggan",
  "/admin/sales": "Laporan Penjualan",
};

export function AdminTopBar({ onLogout, collapsed }: AdminTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const close = () => setUserMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const pageTitle = PAGE_TITLES[pathname] ?? "Admin Panel";

  const formattedDate = currentTime.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header
      className={`
        fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-100
        flex items-center justify-between px-6 transition-all duration-300
        ${collapsed ? "left-[72px]" : "left-64"}
      `}
    >
      {/* Left: Page title */}
      <div>
        <h1 className="text-base font-semibold text-gray-900">{pageTitle}</h1>
        <p className="text-xs text-gray-400 hidden sm:block">
          {formattedDate} · {formattedTime}
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Notifications (placeholder) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative text-gray-500 hover:text-gray-800"
        >
          <Bell className="h-[18px] w-[18px]" />
        </Button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUserMenuOpen((v) => !v);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <User className="h-[14px] w-[14px] text-red-700" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              Admin
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-700">Admin</p>
                <p className="text-xs text-gray-400 truncate">
                  admin@dapoergytra.com
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Lihat Toko
              </button>
              <div className="border-t border-gray-100">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
