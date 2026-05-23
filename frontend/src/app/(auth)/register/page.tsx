"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/inputfield";
import { useToast } from "@/components/toast/toastprovider";
import Image from "next/image";

interface FormFields {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};

  if (!fields.username.trim()) {
    errors.username = "Username wajib diisi.";
  } else if (fields.username.trim().length < 2) {
    errors.username = "Username minimal 2 karakter.";
  }

  if (!fields.email.trim()) {
    errors.email = "Email wajib diisi.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Format email tidak valid.";
  }

  if (!fields.password) {
    errors.password = "Password wajib diisi.";
  } else if (fields.password.length < 8) {
    errors.password = "Password minimal 8 karakter.";
  }

  if (!fields.passwordConfirm) {
    errors.passwordConfirm = "Konfirmasi password wajib diisi.";
  } else if (fields.password !== fields.passwordConfirm) {
    errors.passwordConfirm = "Password tidak cocok.";
  }

  return errors;
}

function getPasswordStrength(password: string): {
  level: 0 | 1 | 2 | 3;
  label: string;
  color: string;
} {
  if (!password) return { level: 0, label: "", color: "" };

  let score = 0;
  const hasMinLength = password.length >= 8;
  const hasUpperLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (hasMinLength) score++;
  if (hasUpperLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  if (!hasMinLength) {
    if (score >= 2) return { level: 2, label: "Sedang", color: "bg-amber-400" };
    return { level: 1, label: "Lemah", color: "bg-red-400" };
  }

  if (score <= 2) return { level: 2, label: "Sedang", color: "bg-amber-400" };
  return { level: 3, label: "Kuat", color: "bg-emerald-500" };
}

export default function RegisterPage() {
  const router = useRouter();
  const { show } = useToast();

  const [fields, setFields] = useState<FormFields>({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(fields.password);

  const handleChange =
    (key: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handleSubmit = async () => {
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      show("Periksa kembali isian formulir.", "warning");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        username: fields.username,
        email: fields.email,
        password: fields.password,
        password_confirmation: fields.passwordConfirm,
      });
      show("Akun berhasil dibuat! Silakan masuk.", "success");
      router.push("/login");
    } catch (err: unknown) {
      const data = (
        err as {
          response?: {
            data?: { errors?: Record<string, string[]>; message?: string };
          };
        }
      )?.response?.data;

      if (data?.errors) {
        const serverErrors: FormErrors = {};
        if (data.errors.username)
          serverErrors.username = data.errors.username[0];
        if (data.errors.email) serverErrors.email = data.errors.email[0];
        if (data.errors.password)
          serverErrors.password = data.errors.password[0];
        setErrors(serverErrors);
        show("Pendaftaran gagal. Periksa kembali isian Anda.", "error");
      } else {
        show(data?.message ?? "Terjadi kesalahan. Coba lagi.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
        <Image
          src="/login.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z"
                  fill="white"
                />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-wide text-slate-800">
              Workly
            </span>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
            <div className="mb-8">
              <p className="text-4xl text-center font-bold text-black mb-4">
                Dapoergytra
              </p>
              <p className="mb-2 text-center text-3xl font-semibold text-black">
                Daftar
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {/* username */}
              <InputField
                label="Username"
                type="text"
                placeholder="John Doe"
                value={fields.username}
                onChange={handleChange("username")}
                onKeyDown={handleKeyDown}
                error={errors.username}
                autoComplete="username"
                autoFocus
              />

              {/* Email */}
              <InputField
                label="Email"
                type="email"
                placeholder="nama@contoh.com"
                value={fields.email}
                onChange={handleChange("email")}
                onKeyDown={handleKeyDown}
                error={errors.email}
                autoComplete="email"
              />

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <InputField
                  label="Password"
                  type="password"
                  placeholder="Min. 8 karakter"
                  value={fields.password}
                  onChange={handleChange("password")}
                  onKeyDown={handleKeyDown}
                  error={errors.password}
                  autoComplete="new-password"
                />

                {fields.password && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex flex-1 gap-1">
                      {([1, 2, 3] as const).map((lvl) => (
                        <div
                          key={lvl}
                          className={[
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            strength.level >= lvl
                              ? strength.color
                              : "bg-slate-100",
                          ].join(" ")}
                        />
                      ))}
                    </div>
                    <span
                      className={[
                        "text-xs font-medium",
                        strength.level === 1
                          ? "text-red-500"
                          : strength.level === 2
                            ? "text-amber-500"
                            : "text-emerald-600",
                      ].join(" ")}
                    >
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Konfirmasi password */}
              <InputField
                label="Konfirmasi Password"
                type="password"
                placeholder="Ulangi password"
                value={fields.passwordConfirm}
                onChange={handleChange("passwordConfirm")}
                onKeyDown={handleKeyDown}
                error={errors.passwordConfirm}
                autoComplete="new-password"
              />

              <Button
                fullWidth
                size="lg"
                loading={loading}
                onClick={handleSubmit}
                className="mt-1"
              >
                Buat Akun
              </Button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-300">atau</span>
              <span className="h-px flex-1 bg-slate-100" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-700 transition-colors hover:text-blue-900 hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
