"use client";

import { useState, useEffect } from "react";
import {
  X,
  Edit,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useProductForm } from "@/hooks/useProductForm";
import { useFileUpload } from "@/hooks/useFileUpload";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/FormField";
import { fotoUrl } from "@/lib/foto";

export interface Kategori {
  id: number;
  nama: string;
}

export interface Produk {
  id: number;
  nama: string;
  harga: number | string;
  deskripsi: string | null;
  foto: string | null;
  stok: number;
  kategori_id: number;
  kategori?: Kategori;
}

interface ProductModalState {
  isLoading: boolean;
  generalError: string | null;
}

export interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProduct: Produk | null;
  kategoris: Kategori[];
}

/* ── Component ── */
export function ProductModal({
  open,
  onClose,
  onSuccess,
  editProduct,
  kategoris,
}: ProductModalProps) {
  const form = useProductForm(editProduct, kategoris, open);
  const fileUpload = useFileUpload();
  const [state, setState] = useState<ProductModalState>({
    isLoading: false,
    generalError: null,
  });
  const [visible, setVisible] = useState(false);

  /* Animate in/out */
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (editProduct && open) {
      fileUpload.setInitialPreview(fotoUrl(editProduct.foto) ?? null);
    } else if (!open) {
      fileUpload.reset();
    }
  }, [open, editProduct]);

  /* Escape key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSubmit = async () => {
    if (!form.validate()) return;

    setState({ isLoading: true, generalError: null });

    try {
      const formData = new FormData();

      formData.append("nama", form.form.nama.trim());
      formData.append("harga", form.form.harga);
      formData.append("stok", form.form.stok);
      formData.append("kategori_id", form.form.kategoriId);

      if (form.form.deskripsi.trim())
        formData.append("deskripsi", form.form.deskripsi.trim());

      if (fileUpload.fotoFile) formData.append("foto", fileUpload.fotoFile);

      if (editProduct) {
        await api.put(`/produk/${editProduct.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/produk", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
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
        form.setServerErrors(data.data);
      } else {
        setState((prev) => ({
          ...prev,
          generalError: data?.message ?? "Terjadi kesalahan.",
        }));
      }
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  if (!open) return null;

  const isEdit = !!editProduct;
  const kategoriOptions = kategoris.map((k) => ({
    value: k.id,
    label: k.nama,
  }));
  const hasErrors = Object.values(form.errors).some(Boolean);

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {/* Backdrop */}
      <div
        className={[
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Modal panel — no internal scroll, fits content */}
      <div
        className={[
          "relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300",
          "max-h-[90vh] flex flex-col",
          visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4",
        ].join(" ")}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-400 to-orange-400 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50">
              {isEdit ? (
                <Edit className="h-4 w-4 text-red-600" />
              ) : (
                <Sparkles className="h-4 w-4 text-red-600" />
              )}
            </div>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — no overflow-y-auto, no scrollbar */}
        <div className="px-6 pt-5 pb-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Error banners */}
          {state.generalError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 mb-5">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{state.generalError}</p>
            </div>
          )}
          {hasErrors && !state.generalError && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 mb-5">
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                Periksa kembali isian di bawah ini.
              </p>
            </div>
          )}

          {/* ── Foto Produk ── */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Produk
            </label>
            <div
              onClick={fileUpload.triggerFileDialog}
              className={[
                "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-gray-50 cursor-pointer transition-colors hover:border-red-300 hover:bg-red-50/30",
                fileUpload.fotoPreview ? "p-0 overflow-hidden" : "py-8",
                form.errors.foto ? "border-red-300" : "border-gray-200",
              ].join(" ")}
              style={{ minHeight: "120px" }}
            >
              {fileUpload.fotoPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={fileUpload.fotoPreview}
                  alt="Preview foto produk"
                  className="w-full h-40 object-cover rounded-2xl"
                />
              ) : (
                <>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      Klik untuk upload foto
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      PNG, JPG, WEBP — maks. 2MB
                    </p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileUpload.fileRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className="hidden"
              onChange={fileUpload.handleFile}
            />
            {form.errors.foto && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {form.errors.foto}
              </p>
            )}
          </div>

          {/* ── Info Produk ── */}
          <div className="space-y-4 mb-5">
            <InputField
              label="Nama Produk"
              value={form.form.nama}
              onChange={(e) => form.updateField("nama", e.target.value)}
              placeholder="cth. Brownies Coklat Premium"
              error={form.errors.nama}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <InputField
                  type="number"
                  label="Harga (Rp)"
                  min="0"
                  value={form.form.harga}
                  onChange={(e) => form.updateField("harga", e.target.value)}
                  placeholder="75000"
                  error={form.errors.harga}
                  required
                />
                {form.form.harga && !form.errors.harga && (
                  <p className="mt-1 text-xs text-gray-400">
                    {Number(form.form.harga).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                )}
              </div>
              <div>
                <InputField
                  type="number"
                  label="Stok"
                  min="0"
                  value={form.form.stok}
                  onChange={(e) => form.updateField("stok", e.target.value)}
                  placeholder="50"
                  error={form.errors.stok}
                  required
                />
                {form.form.stok && !form.errors.stok && (
                  <p
                    className={[
                      "mt-1 text-xs font-medium",
                      Number(form.form.stok) === 0
                        ? "text-red-500"
                        : Number(form.form.stok) <= 5
                          ? "text-amber-500"
                          : "text-green-600",
                    ].join(" ")}
                  >
                    {Number(form.form.stok) === 0
                      ? "Stok habis"
                      : Number(form.form.stok) <= 5
                        ? "Stok hampir habis"
                        : "Stok tersedia"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Kategori ── */}
          <div className="space-y-3 mb-5">
            <SelectField
              label="Kategori"
              value={form.form.kategoriId}
              onChange={(e) => form.updateField("kategoriId", e.target.value)}
              options={kategoriOptions}
              error={form.errors.kategori_id}
              required
            />

            {kategoris.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {kategoris.map((k) => {
                  const selected =
                    String(form.form.kategoriId) === String(k.id);
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() =>
                        form.updateField("kategoriId", String(k.id))
                      }
                      className={[
                        "text-xs px-3 py-1.5 rounded-full border font-medium transition-all",
                        selected
                          ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-500 hover:border-red-300 hover:text-red-600",
                      ].join(" ")}
                    >
                      {selected && (
                        <CheckCircle2 className="h-3 w-3 inline mr-1 -mt-0.5" />
                      )}
                      {k.nama}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Deskripsi ── */}
          <div className="mb-6">
            <TextareaField
              label="Deskripsi"
              value={form.form.deskripsi}
              onChange={(e) => form.updateField("deskripsi", e.target.value)}
              placeholder="Tuliskan deskripsi singkat yang menarik tentang produk ini..."
              rows={3}
              optional
            />
            <div className="flex justify-end mt-1.5">
              <span className="text-xs text-gray-400">
                {form.form.deskripsi.length} karakter
              </span>
            </div>
          </div>

          {/* ── Action buttons — inline, no separate footer ── */}
          {/* On mobile: full-width stacked (split); on sm+: side by side right-aligned */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={state.isLoading}
              className="w-full sm:w-auto rounded-xl px-6"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              loading={state.isLoading}
              className="w-full sm:w-auto rounded-xl px-6 bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200"
            >
              {state.isLoading
                ? isEdit
                  ? "Menyimpan..."
                  : "Menambahkan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Tambah Produk"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
