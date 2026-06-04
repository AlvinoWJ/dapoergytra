"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Shield,
  User,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

/* ── Types ── */
interface UserRow {
  id: number;
  username: string;
  email: string;
  role: "admin" | "customer";
  created_at: string | null;
}

interface Totals {
  all: number;
  admin: number;
  customer: number;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

interface AddAdminForm {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface AddAdminErrors {
  username?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  general?: string;
}

/* ── Skeleton ── */
function RowSkeleton() {
  return (
    <tr className="border-b animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

/* ── Initials Avatar ── */
function Avatar({ name, role }: { name: string; role: "admin" | "customer" }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
        role === "admin"
          ? "bg-red-100 text-red-800"
          : "bg-purple-100 text-purple-800"
      }`}
    >
      {initials}
    </div>
  );
}

/* ── Add Admin Modal ── */
interface AddAdminModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function AddAdminModal({ open, onClose, onSuccess }: AddAdminModalProps) {
  const [form, setForm] = useState<AddAdminForm>({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<AddAdminErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
      setForm({
        username: "",
        email: "",
        password: "",
        password_confirmation: "",
      });
      setErrors({});
    } else {
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange =
    (key: keyof AddAdminForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      setErrors((p) => ({ ...p, [key]: undefined, general: undefined }));
    };

  const validate = (): AddAdminErrors => {
    const err: AddAdminErrors = {};
    if (!form.username.trim()) err.username = "Username wajib diisi.";
    else if (form.username.trim().length < 3)
      err.username = "Minimal 3 karakter.";
    if (!form.email.trim()) err.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Format email tidak valid.";
    if (!form.password) err.password = "Password wajib diisi.";
    else if (form.password.length < 8) err.password = "Minimal 8 karakter.";
    if (form.password !== form.password_confirmation)
      err.password_confirmation = "Password tidak cocok.";
    return err;
  };

  const handleSubmit = async () => {
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setLoading(true);
    try {
      await api.post("/users", form);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const data = (
        err as {
          response?: {
            data?: { data?: Record<string, string[]>; message?: string };
          };
        }
      )?.response?.data;
      if (data?.data) {
        const se: AddAdminErrors = {};
        if (data.data.username) se.username = data.data.username[0];
        if (data.data.email) se.email = data.data.email[0];
        if (data.data.password) se.password = data.data.password[0];
        setErrors(se);
      } else {
        setErrors({ general: data?.message ?? "Terjadi kesalahan." });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const inputCls = (err?: string) =>
    [
      "w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 outline-none transition-all",
      "focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-200",
      err ? "border-red-300" : "border-slate-200",
    ].join(" ");

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-400 to-orange-400" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Shield className="h-4 w-4 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold">Tambah Akun Admin</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6 space-y-4">
          {errors.general && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="flex-shrink-0 mt-px">⚠</span>
              <span>{errors.general}</span>
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.username}
              onChange={handleChange("username")}
              placeholder="admin_baru"
              autoComplete="off"
              className={inputCls(errors.username)}
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="admin@dapoergytra.com"
              autoComplete="off"
              className={inputCls(errors.email)}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={handleChange("password")}
                placeholder="Min. 8 karakter"
                autoComplete="new-password"
                className={[inputCls(errors.password), "pr-12"].join(" ")}
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={form.password_confirmation}
                onChange={handleChange("password_confirmation")}
                placeholder="Ulangi password"
                autoComplete="new-password"
                className={[
                  inputCls(errors.password_confirmation),
                  "pr-12",
                ].join(" ")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="text-xs text-red-500">
                {errors.password_confirmation}
              </p>
            )}
          </div>

          {/* Info note */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Akun ini akan memiliki akses penuh ke panel admin dapoergytra.
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl"
            >
              Batal
            </Button>
            <Button
              loading={loading}
              onClick={handleSubmit}
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700"
            >
              Buat Akun Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [totals, setTotals] = useState<Totals>({
    all: 0,
    admin: 0,
    customer: 0,
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const params: Record<string, string | number> = { per_page: 20, page };
        if (roleFilter !== "all") params.role = roleFilter;
        if (search) params.search = search;

        const res = await api.get("/users", { params });
        if (res.data?.success) {
          setUsers(res.data.data?.data ?? []);
          setPagination({
            current_page: res.data.data.current_page,
            last_page: res.data.data.last_page,
            total: res.data.data.total,
            per_page: res.data.data.per_page,
          });
          if (res.data.totals) setTotals(res.data.totals);
        }
      } catch (err) {
        console.error(err);
        showToast("Gagal memuat data pengguna.", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, roleFilter, search],
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminAuth = localStorage.getItem("adminAuth");
    if (!token || !adminAuth) {
      router.replace("/admin/login");
      return;
    }
    fetchUsers();
  }, [router, fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search]);

  const handleSearch = () => setSearch(searchInput.trim());

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statCards = [
    {
      label: "Total Pengguna",
      value: totals.all,
      icon: Users,
      color: "text-blue-600",
      iconBg: "bg-blue-100",
      cardBg: "bg-blue-50",
    },
    {
      label: "Admin",
      value: totals.admin,
      icon: Shield,
      color: "text-red-600",
      iconBg: "bg-red-100",
      cardBg: "bg-red-50",
    },
    {
      label: "Pelanggan",
      value: totals.customer,
      icon: User,
      color: "text-purple-600",
      iconBg: "bg-purple-100",
      cardBg: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : "⚠"}</span>
          {toast.msg}
        </div>
      )}

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pelanggan & Admin
            </h1>
            <p className="text-gray-500 mt-1">
              {loading ? "Memuat..." : `${totals.all} pengguna terdaftar`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              title="Refresh"
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Admin
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className={`${s.cardBg} border-none`}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{s.label}</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {loading ? "—" : s.value}
                      </p>
                    </div>
                    <div className={`${s.iconBg} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${s.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Cari username atau email..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {[
              { value: "all", label: "Semua" },
              { value: "admin", label: "Admin" },
              { value: "customer", label: "Pelanggan" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRoleFilter(opt.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  roleFilter === opt.value
                    ? opt.value === "admin"
                      ? "bg-red-600 text-white border-red-600"
                      : opt.value === "customer"
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {["Pengguna", "Email", "Role", "Bergabung"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 font-semibold text-gray-700"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <RowSkeleton key={i} />
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-gray-400">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                      <p className="font-medium">
                        Tidak ada pengguna ditemukan
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.username} role={user.role} />
                          <span className="font-medium text-gray-900">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{user.email}</td>
                      <td className="px-5 py-4">
                        {user.role === "admin" ? (
                          <Badge className="bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 w-fit">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge className="bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1 w-fit">
                            <User className="h-3 w-3" />
                            Pelanggan
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t">
              <p className="text-sm text-gray-500">
                Halaman {pagination.current_page} dari {pagination.last_page} ·{" "}
                {pagination.total} pengguna
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* Add Admin Modal */}
      <AddAdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          showToast("Akun admin berhasil dibuat.");
          fetchUsers(true);
        }}
      />
    </div>
  );
}
