"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Button from "@/components/ui/button";
import InputField from "@/components/ui/inputfield";
import Image from "next/image";
import { useToast } from "@/components/toast/toastprovider";

interface FormFields {
  login: string;
  password: string;
}

interface FormErrors {
  login?: string;
  password?: string;
}

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};

  if (!fields.login.trim()) {
    errors.login = "Email atau Username wajib diisi.";
  }

  if (!fields.password) {
    errors.password = "Password wajib diisi.";
  }

  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const { show } = useToast();

  const [fields, setFields] = useState<FormFields>({ login: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange =
    (key: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
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

      const token = res.data?.data?.access_token;
      if (token) localStorage.setItem("token", token);

      show("Login berhasil!", "success");
      router.push("/dashboard");
    } catch (err: unknown) {
      const response = (
        err as {
          response?: {
            status?: number;
            data?: {
              success?: boolean;
              message?: string;
              data?: Record<string, string[]> | null;
            };
          };
        }
      )?.response;

      const status = response?.status;
      const message = response?.data?.message;
      const data = response?.data?.data;

      if (status === 422 && data) {
        const serverErrors: FormErrors = {};
        if (data.login) serverErrors.login = data.login[0];
        if (data.password) serverErrors.password = data.password[0];
        setErrors(serverErrors);
        return;
      }

      show(message ?? "Login gagal. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
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
                label="Email / Username"
                type="text"
                placeholder="nama@contoh.com atau username"
                value={fields.login}
                onChange={handleChange("login")}
                onKeyDown={handleKeyDown}
                error={errors.login}
                autoComplete="email"
                autoFocus
              />

              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={fields.password}
                onChange={handleChange("password")}
                onKeyDown={handleKeyDown}
                error={errors.password}
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
                onClick={handleSubmit}
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
