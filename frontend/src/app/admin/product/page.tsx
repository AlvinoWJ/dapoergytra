"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import api from "@/lib/api";

/* ── Types ── */
interface Kategori {
  id: number;
  nama: string;
}

interface Produk {
  id: number;
  nama: string;
  harga: number | string;
  deskripsi: string | null;
  foto: string | null;
  stok: number;
  kategori_id: number;
  kategori?: Kategori;
}

interface PaginatedResponse {
  data: Produk[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

interface FormErrors {
  nama?: string;
  harga?: string;
  stok?: string;
  kategori_id?: string;
  foto?: string;
  general?: string;
}

/* ── Skeleton ── */
function ProductSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <CardContent className="p-4 space-y-2">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Modal ── */
interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProduct: Produk | null;
  kategoris: Kategori[];
}

function ProductModal({
  open,
  onClose,
  onSuccess,
  editProduct,
  kategoris,
}: ProductModalProps) {
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (editProduct) {
      setNama(editProduct.nama);
      setHarga(String(editProduct.harga));
      setStok(String(editProduct.stok));
      setDeskripsi(editProduct.deskripsi ?? "");
      setKategoriId(String(editProduct.kategori_id));
      setFotoPreview(editProduct.foto ?? null);
    } else {
      setNama("");
      setHarga("");
      setStok("");
      setDeskripsi("");
      setKategoriId(kategoris[0] ? String(kategoris[0].id) : "");
      setFotoPreview(null);
    }
    setFotoFile(null);
    setErrors({});
  }, [open, editProduct, kategoris]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!nama.trim()) errs.nama = "Nama produk wajib diisi.";
    if (!harga || isNaN(Number(harga)) || Number(harga) < 0)
      errs.harga = "Harga tidak valid.";
    if (!stok || isNaN(Number(stok)) || Number(stok) < 0)
      errs.stok = "Stok tidak valid.";
    if (!kategoriId) errs.kategori_id = "Kategori wajib dipilih.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nama", nama.trim());
      formData.append("harga", harga);
      formData.append("stok", stok);
      formData.append("kategori_id", kategoriId);
      if (deskripsi.trim()) formData.append("deskripsi", deskripsi.trim());
      if (fotoFile) formData.append("foto", fotoFile);

      if (editProduct) {
        // Laravel doesn't support FormData with PUT/PATCH, use POST with _method
        formData.append("_method", "PUT");
        await api.post(`/produk/${editProduct.id}`, formData, {
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
        const errs: FormErrors = {};
        if (data.data.nama) errs.nama = data.data.nama[0];
        if (data.data.harga) errs.harga = data.data.harga[0];
        if (data.data.stok) errs.stok = data.data.stok[0];
        if (data.data.kategori_id) errs.kategori_id = data.data.kategori_id[0];
        if (data.data.foto) errs.foto = data.data.foto[0];
        setErrors(errs);
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
      "w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all",
      "focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-200",
      err ? "border-red-300" : "border-slate-200",
    ].join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {editProduct ? "Edit Produk" : "Tambah Produk"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errors.general && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          {/* Foto */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Foto Produk
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative h-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer overflow-hidden flex items-center justify-center"
            >
              {fotoPreview ? (
                <Image
                  src={fotoPreview}
                  alt="preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Klik untuk upload gambar</span>
                  <span className="text-xs">JPEG, PNG, WebP (maks 2MB)</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className="hidden"
              onChange={handleFile}
            />
            {errors.foto && (
              <p className="text-xs text-red-500">{errors.foto}</p>
            )}
          </div>

          {/* Nama */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Nama Produk
            </label>
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Brownies Coklat Premium"
              className={inputCls(errors.nama)}
            />
            {errors.nama && (
              <p className="text-xs text-red-500">{errors.nama}</p>
            )}
          </div>

          {/* Harga & Stok */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Harga (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                placeholder="75000"
                className={inputCls(errors.harga)}
              />
              {errors.harga && (
                <p className="text-xs text-red-500">{errors.harga}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Stok</label>
              <input
                type="number"
                min="0"
                value={stok}
                onChange={(e) => setStok(e.target.value)}
                placeholder="50"
                className={inputCls(errors.stok)}
              />
              {errors.stok && (
                <p className="text-xs text-red-500">{errors.stok}</p>
              )}
            </div>
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Kategori
            </label>
            <select
              value={kategoriId}
              onChange={(e) => setKategoriId(e.target.value)}
              className={inputCls(errors.kategori_id)}
            >
              <option value="">Pilih kategori</option>
              {kategoris.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
            {errors.kategori_id && (
              <p className="text-xs text-red-500">{errors.kategori_id}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Deskripsi{" "}
              <span className="font-normal text-slate-400">(Opsional)</span>
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi singkat produk..."
              rows={3}
              className={inputCls()}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {editProduct ? "Simpan Perubahan" : "Tambah Produk"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminProductsPage() {
  const router = useRouter();
  const [produk, setProduk] = useState<Produk[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Produk | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchKategoris = useCallback(async () => {
    try {
      const res = await api.get("/kategori");
      if (res.data?.success) setKategoris(res.data.data);
    } catch {}
  }, []);

  const fetchProduk = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const params: Record<string, string | number> = {
          per_page: 12,
          page,
        };
        if (search) params.search = search;
        if (selectedKategori) params.kategori_id = selectedKategori;

        const res = await api.get("/produk", { params });
        if (res.data?.success) {
          const data: PaginatedResponse = res.data.data;
          setProduk(data.data);
          setPagination({
            current_page: data.current_page,
            last_page: data.last_page,
            total: data.total,
          });
        }
      } catch {
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, selectedKategori],
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminAuth = localStorage.getItem("adminAuth");
    if (!token || !adminAuth) {
      router.replace("/admin/login");
      return;
    }
    fetchKategoris();
  }, [router, fetchKategoris]);

  useEffect(() => {
    fetchProduk();
  }, [fetchProduk]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, selectedKategori]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus produk "${nama}"?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/produk/${id}`);
      showToast("Produk berhasil dihapus.");
      fetchProduk(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal menghapus produk.";
      showToast(msg, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const openEdit = (p: Produk) => {
    setEditProduct(p);
    setModalOpen(true);
  };

  const onModalSuccess = () => {
    showToast(
      editProduct
        ? "Produk berhasil diperbarui."
        : "Produk berhasil ditambahkan.",
    );
    fetchProduk(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={[
            "fixed top-5 right-5 z-[9999] flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg text-sm font-medium transition-all",
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
        >
          <span
            className={
              toast.type === "success" ? "text-green-500" : "text-red-500"
            }
          >
            {toast.type === "success" ? "✓" : "⚠"}
          </span>
          {toast.msg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Produk</h1>
            <p className="text-gray-500 mt-1">
              {loading ? "Memuat..." : `${pagination.total} produk total`}
            </p>
          </div>
          <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Cari nama produk..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
              />
            </div>
          </div>
          {/* Filter kategori */}
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 min-w-[160px]"
          >
            <option value="">Semua Kategori</option>
            {kategoris.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : produk.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Produk tidak ditemukan</p>
            <p className="text-sm mt-1">
              Coba ubah filter atau tambah produk baru.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produk.map((p) => {
              const harga = Number(p.harga);
              return (
                <Card
                  key={p.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    {p.foto ? (
                      <Image
                        src={p.foto}
                        alt={p.nama}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/cake_hero.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🎂
                      </div>
                    )}
                    {p.stok === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold bg-red-600 px-3 py-1 rounded-full">
                          Habis
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {p.kategori?.nama ?? "—"}
                    </Badge>
                    <h3 className="font-semibold mb-1 line-clamp-1 text-sm">
                      {p.nama}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {p.deskripsi ?? "—"}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-red-700 text-sm">
                        Rp {harga.toLocaleString("id-ID")}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.stok === 0
                            ? "bg-red-100 text-red-700"
                            : p.stok <= 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        Stok: {p.stok}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => openEdit(p)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(p.id, p.nama)}
                        disabled={deletingId === p.id}
                      >
                        {deletingId === p.id ? (
                          <span className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent inline-block" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-1" />
                        )}
                        Hapus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.last_page > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">
              Halaman {pagination.current_page} dari {pagination.last_page}
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
      </main>

      {/* Modal */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onModalSuccess}
        editProduct={editProduct}
        kategoris={kategoris}
      />
    </div>
  );
}
