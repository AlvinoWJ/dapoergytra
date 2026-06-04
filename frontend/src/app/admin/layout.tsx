"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin_sidebar";
import { AdminTopBar } from "@/components/admin/admin_topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminAuth = localStorage.getItem("adminAuth");
    if (!token || !adminAuth) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
  };

  // Keep sidebar collapse state in sync for topbar
  // We pass collapsed down; sidebar manages its own internal state
  // but exposes it via a callback here
  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        onLogout={handleLogout}
        onCollapseChange={setSidebarCollapsed}
      />

      <AdminTopBar onLogout={handleLogout} collapsed={sidebarCollapsed} />

      {/* Main content — offset for sidebar and topbar */}
      <main
        className={`
          pt-16 min-h-screen transition-all duration-300
          ${sidebarCollapsed ? "pl-[72px]" : "pl-64"}
        `}
      >
        <div>{children}</div>
      </main>
    </div>
  );
}
