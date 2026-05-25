"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { fotoUrl } from "@/lib/foto";
import { ArrowLeft, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartContext } from "@/components/cart/cart_provider";
import { useToast } from "@/components/toast/toastprovider";
import api from "@/lib/api";

/* ── Types ── */
interface FormFields {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

/* ── Validation ── */
function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.name.trim()) errors.name = "Nama penerima wajib diisi.";
  if (!fields.phone.trim()) errors.phone = "Nomor telepon wajib diisi.";
  else if (!/^0[0-9]{8,12}$/.test(fields.phone.trim()))
    errors.phone = "Format nomor telepon tidak valid.";
  if (!fields.address.trim()) errors.address = "Alamat lengkap wajib diisi.";
  return errors;
}

/* ── Payment option component ── */
// function PaymentOption({
//   value,
//   selected,
//   onSelect,
//   title,
//   subtitle,
// }: {
//   value: string;
//   selected: boolean;
//   onSelect: (v: string) => void;
//   title: string;
//   subtitle: string;
// }) {
//   return (
//     <div
//       onClick={() => onSelect(value)}
//       className={[
//         "flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all",
//         selected
//           ? "border-red-500 bg-red-50"
//           : "border-slate-200 hover:bg-slate-50",
//       ].join(" ")}
//     >
//       {/* Custom radio */}
//       <span
//         className={[
//           "h-4 w-4 rounded-full border-2 flex-shrink-0 transition-all",
//           selected
//             ? "border-red-600 bg-red-600 shadow-[inset_0_0_0_2px_white]"
//             : "border-slate-300",
//         ].join(" ")}
//       />
//       <div>
//         <p className="font-semibold text-sm">{title}</p>
//         <p className="text-xs text-slate-500">{subtitle}</p>
//       </div>
//     </div>
//   );
// }

/* ── Main Page ── */
export default function CheckoutPage() {
  const router = useRouter();
  const { show } = useToast();
  const { items, totalPrice, clearCart } = useCartContext();

  const [fields, setFields] = useState<FormFields>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);
  const redirectedRef = useRef(false);

  const shippingCost = 15000;
  const total = totalPrice + shippingCost;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setIsLoggedIn(true);
    setChecked(true);
  }, [router]);

  useEffect(() => {
    if (!checked || !isLoggedIn) return;
    if (items.length === 0 && !redirectedRef.current) {
      redirectedRef.current = true;
      router.replace("/dashboard");
    }
  }, [checked, isLoggedIn, items.length, router]);

  if (!checked || !isLoggedIn || items.length === 0) return null;

  const handleChange =
    (key: keyof FormFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key as keyof FormErrors])
        setErrors((prev) => ({ ...prev, [key]: undefined }));
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
      const res = await api.post("/checkout", {
        nama_penerima: fields.name,
        no_hp: fields.phone,
        alamat: fields.address,
        catatan: fields.notes || null,
      });

      if (res.data?.success) {
        await clearCart();
        show("Pesanan dibuat! Mengarahkan ke halaman pembayaran...", "success");

        const invoiceUrl = res.data?.data?.invoice_url;

        if (invoiceUrl) {
          window.location.href = invoiceUrl;
        } else {
          router.push("/orders");
        }
      }
    } catch (err: unknown) {
      const data = (
        err as {
          response?: {
            data?: { message?: string; errors?: Record<string, string[]> };
          };
        }
      )?.response?.data;

      if (data?.errors) {
        const serverErrors: FormErrors = {};
        if (data.errors.nama_penerima)
          serverErrors.name = data.errors.nama_penerima[0];
        if (data.errors.no_hp) serverErrors.phone = data.errors.no_hp[0];
        if (data.errors.alamat) serverErrors.address = data.errors.alamat[0];
        setErrors(serverErrors);
        show("Gagal membuat pesanan. Periksa kembali isian.", "error");
      } else {
        show(data?.message ?? "Terjadi kesalahan. Coba lagi.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared input class ── */
  const inputClass = (error?: string) =>
    [
      "w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-300 outline-none transition-all duration-150",
      "focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-200",
      error ? "border-red-300" : "border-slate-200",
    ].join(" ");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/cart")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold">Checkout Pesanan</h1>
          <p className="text-gray-600 mt-2">
            Lengkapi informasi pengiriman dan pembayaran Anda
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-5">
                  Informasi Pengiriman
                </h2>
                <div className="flex flex-col gap-4">
                  {/* Nama */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Nama Penerima
                    </label>
                    <input
                      type="text"
                      value={fields.name}
                      onChange={handleChange("name")}
                      placeholder="Nama lengkap"
                      className={inputClass(errors.name)}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={fields.phone}
                      onChange={handleChange("phone")}
                      placeholder="08xxxxxxxxxx"
                      className={inputClass(errors.phone)}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Alamat Lengkap
                    </label>
                    <textarea
                      value={fields.address}
                      onChange={handleChange("address")}
                      placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota"
                      rows={3}
                      className={inputClass(errors.address)}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-500">{errors.address}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Catatan{" "}
                      <span className="font-normal text-slate-400">
                        (Opsional)
                      </span>
                    </label>
                    <textarea
                      value={fields.notes}
                      onChange={handleChange("notes")}
                      placeholder="Tambahkan catatan untuk pesanan Anda"
                      rows={2}
                      className={inputClass()}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-5">
                  Metode Pembayaran
                </h2>
                <div className="flex items-center gap-4 border border-red-400 bg-red-50 rounded-xl p-4">
                  <div className="h-10 w-10 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">
                    <QrCode className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">QRIS</p>
                    <p className="text-xs text-slate-500">
                      Scan QR dengan aplikasi apapun — GoPay, OVO, DANA,
                      ShopeePay, m-Banking, dll
                    </p>
                  </div>
                  <span className="ml-auto h-4 w-4 rounded-full border-2 border-red-600 bg-red-600 shadow-[inset_0_0_0_2px_white] flex-shrink-0" />
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Setelah klik &ldquo;Konfirmasi Pesanan&rdquo;, Anda akan
                  diarahkan ke halaman pembayaran untuk scan QRIS.
                </p>
              </CardContent>
            </Card>

            {/* Mobile submit */}
            <div className="flex gap-3 lg:hidden">
              <Button
                variant="outline"
                onClick={() => router.push("/cart")}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                loading={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? "Memproses..." : "Konfirmasi & Bayar"}
              </Button>
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">
                  Ringkasan Pesanan
                </h2>

                {/* Items */}
                <div className="flex flex-col gap-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 relative">
                        <ImageWithFallback
                          src={fotoUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-red-700">
                          Rp{" "}
                          {(item.price * item.quantity).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({items.reduce((s, i) => s + i.quantity, 0)}{" "}
                      item)
                    </span>
                    <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkir</span>
                    <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-red-700">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Desktop submit */}
                <div className="mt-6 hidden lg:flex flex-col gap-3">
                  <Button
                    onClick={handleSubmit}
                    loading={loading}
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="lg"
                  >
                    Konfirmasi Pesanan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/cart")}
                    className="w-full"
                  >
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
