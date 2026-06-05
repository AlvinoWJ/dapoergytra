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

function NavItem({
  icon: Icon,
  label,
  active,
  collapsed,
  onClick,
  href,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const inner = (
    <div
      className={`
        group relative flex items-center rounded-lg cursor-pointer
        transition-[background-color,color] duration-200
        h-9
        ${
          active
            ? "bg-red-600 text-white"
            : danger
              ? "text-red-500 hover:bg-red-50 hover:text-red-700"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-9 h-9 flex-shrink-0">
        <Icon className="h-[18px] w-[18px]" />
      </div>

      <div
        className={`
          overflow-hidden whitespace-nowrap
          transition-[width,opacity] duration-300 ease-in-out
          ${collapsed ? "w-0 opacity-0" : "w-36 opacity-100"}
        `}
      >
        <span className="text-sm font-medium pr-3">{label}</span>
      </div>

      {collapsed && (
        <div
          className="
            absolute left-full ml-2 px-2.5 py-1.5 z-50
            bg-gray-900 text-white text-xs rounded-md
            opacity-0 group-hover:opacity-100
            pointer-events-none whitespace-nowrap shadow-lg
            transition-opacity duration-150
          "
          role="tooltip"
        >
          {label}
          <span
            className="
              absolute right-full top-1/2 -translate-y-1/2
              border-4 border-transparent border-r-gray-900
            "
          />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

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

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-full
        bg-white border-r border-gray-100
        flex flex-col
        transition-[width] duration-300 ease-in-out
        overflow-hidden
        ${collapsed ? "w-[56px]" : "w-56"}
      `}
    >
      <div className="h-16 flex items-center flex-shrink-0 border-b border-gray-100">
        <button
          onClick={toggle}
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          className="flex items-center justify-center w-9 h-9 ml-[calc((56px-36px)/2)]
                     rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                     transition-colors flex-shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <div
          className={`
            overflow-hidden whitespace-nowrap flex items-center gap-2
            transition-[width,opacity] duration-300 ease-in-out
            ${collapsed ? "w-0 opacity-0" : "w-40 opacity-100"}
          `}
        >
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 ml-1"
          >
            <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[9px] font-extrabold leading-none">
                DG
              </span>
            </div>
            <span className="font-extrabold text-sm text-red-700 tracking-tight">
              dapoergytra
            </span>
          </Link>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={pathname === item.path}
            collapsed={collapsed}
            href={item.path}
          />
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-gray-100 space-y-0.5 flex-shrink-0">
        <NavItem
          icon={Store}
          label="Lihat toko"
          collapsed={collapsed}
          onClick={() => router.push("/dashboard")}
        />
        <NavItem
          icon={LogOut}
          label="Logout"
          collapsed={collapsed}
          onClick={onLogout}
          danger
        />
      </div>
    </aside>
  );
}
