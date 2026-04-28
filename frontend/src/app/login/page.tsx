"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Button from "@/components/ui/button";
import InputField from "@/components/ui/inputfield";
import Image from "next/image";
import { useToast } from "@/components/toast/toastprovider";

export default function LoginPage() {
  const router = useRouter();
  const { show } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      const token = res.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        show("Login berhasil! Selamat datang kembali.", "success");
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login gagal. Periksa email dan password Anda.";
      setError(message);
      show(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="relative flex min-h-screen">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/login_2.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay gelap agar teks/card lebih kontras */}
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
            <div className="mb-8">
              <p className="text-4xl text-center font-bold text-black mb-4">
                Dapoergytra
              </p>
              <p className="mb-2 text-center text-3xl font-semibold text-black">
                Masuk
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <InputField
                label="Email"
                type="email"
                placeholder="nama@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
                autoFocus
              />

              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                rightLabel={
                  <Link
                    href="/forgot-password"
                    className="font-normal text-blue-700 transition-colors hover:text-blue-900 hover:underline"
                  >
                    Lupa password?
                  </Link>
                }
              />

              <Button
                fullWidth
                size="lg"
                loading={loading}
                onClick={handleLogin}
                className="mt-1"
              >
                Masuk
              </Button>
            </div>
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">atau</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <p className="text-center text-sm text-slate-500">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-700 transition-colors hover:text-blue-900 hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
