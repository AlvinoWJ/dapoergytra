"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Store,
  LogOut,
  Users,
} from "lucide-react";

interface AdminSidebarProps {
  onLogout: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/produk", label: "Produk", icon: Package },
  { path: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart },
  { path: "/admin/users", label: "Pelanggan", icon: Users },
  { path: "/admin/sales", label: "Laporan", icon: TrendingUp },
];

export function AdminSidebar({
  onLogout,
  onCollapseChange,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapseChange?.(next);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-full bg-white border-r border-gray-100 shadow-sm
        flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-64"}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
        {!collapsed ? (
          <>
            <Link href="/admin/dashboard">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-extrabold leading-none">
                    DG
                  </span>
                </div>
                <span className="font-extrabold text-base text-red-700 tracking-tight">
                  dapoergytra
                </span>
              </div>
            </Link>
            <button
              onClick={toggle}
              className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center w-full gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-extrabold leading-none">
                DG
              </span>
            </div>
            <button
              onClick={toggle}
              className="h-6 w-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-150 cursor-pointer
                  ${collapsed ? "justify-center" : ""}
                  ${
                    active
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon
                  className={`h-[18px] w-[18px] flex-shrink-0 ${active ? "text-white" : ""}`}
                />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-0.5 flex-shrink-0">
        <button
          onClick={() => router.push("/dashboard")}
          className={`
            group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all duration-150
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <Store className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium">Lihat Toko</span>
          )}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
              Lihat Toko
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          )}
        </button>

        <button
          onClick={onLogout}
          className={`
            group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-150
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
              Logout
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
