"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

interface FormFields {
  login: string;
  password: string;
}

interface FormErrors {
  login?: string;
  password?: string;
  general?: string;
}

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.login.trim()) errors.login = "Username atau email wajib diisi.";
  if (!fields.password) errors.password = "Password wajib diisi.";
  return errors;
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [fields, setFields] = useState<FormFields>({ login: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange =
    (key: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key])
        setErrors((prev) => ({
          ...prev,
          [key]: undefined,
          general: undefined,
        }));
    };

  const handleSubmit = async () => {
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        login: fields.login,
        password: fields.password,
      });

      const user = res.data?.data?.user;
      const token = res.data?.data?.access_token;

      if (user?.role !== "admin") {
        setErrors({ general: "Akses ditolak. Anda bukan administrator." });
        return;
      }

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("adminAuth", "true");
      }

      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const response = (
        err as {
          response?: {
            status?: number;
            data?: { message?: string; data?: Record<string, string[]> | null };
          };
        }
      )?.response;

      const status = response?.status;
      const data = response?.data;

      if (status === 422 && data?.data) {
        const serverErrors: FormErrors = {};
        if (data.data.login) serverErrors.login = data.data.login[0];
        if (data.data.password) serverErrors.password = data.data.password[0];
        setErrors(serverErrors);
      } else if (status === 401) {
        setErrors({ general: "Email/username atau password salah." });
      } else {
        setErrors({
          general: data?.message ?? "Terjadi kesalahan. Coba lagi.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <aside className="hidden lg:flex w-[45%] relative flex-col items-center justify-center overflow-hidden bg-gray-900">
        <Image
          src="/login.png"
          alt="Admin background"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="relative z-10 text-center px-10">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Admin Panel</h2>
          <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
            Kelola produk, pesanan, dan pelanggan dapoergytra dari satu tempat.
          </p>
        </div>
      </aside>

      {/* Right Panel */}
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">
              Admin dapoergytra
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
            <div className="mb-8 text-center">
              <p className="text-4xl font-bold text-black mb-2">Dapoergytra</p>
              <p className="text-2xl font-semibold text-slate-700">
                Admin Login
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Masuk ke panel administrator
              </p>
            </div>

            {errors.general && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <span className="mt-px shrink-0 text-base leading-none">⚠</span>
                <span>{errors.general}</span>
              </div>
            )}

            <div className="flex flex-col gap-5">
              {/* Login field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Email / Username
                </label>
                <input
                  type="text"
                  value={fields.login}
                  onChange={handleChange("login")}
                  onKeyDown={handleKeyDown}
                  placeholder="admin@dapoergytra.com"
                  autoComplete="username"
                  autoFocus
                  className={[
                    "w-full rounded-xl border bg-slate-50 px-4 py-3 text-base text-slate-800 placeholder-slate-300 outline-none transition-all duration-150",
                    "focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-200",
                    errors.login
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200",
                  ].join(" ")}
                />
                {errors.login && (
                  <p className="text-xs text-red-500">{errors.login}</p>
                )}
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={fields.password}
                    onChange={handleChange("password")}
                    onKeyDown={handleKeyDown}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={[
                      "w-full rounded-xl border bg-slate-50 px-4 py-3 pr-12 text-base text-slate-800 placeholder-slate-300 outline-none transition-all duration-150",
                      "focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-200",
                      errors.password
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff size={20} strokeWidth={1.5} />
                    ) : (
                      <Eye size={20} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                fullWidth
                size="lg"
                loading={loading}
                onClick={handleSubmit}
                className="mt-1 bg-red-600 hover:bg-red-700"
              >
                Masuk sebagai Admin
              </Button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Kembali ke Toko
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
