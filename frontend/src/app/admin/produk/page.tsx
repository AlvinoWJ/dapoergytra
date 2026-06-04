"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { ProductModal, Produk, Kategori } from "@/components/product_modal";
import { fotoUrl } from "@/lib/foto";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { useConfirmModal } from "@/hooks/useConfirmationModal";
import ConfirmationModal from "@/components/confirmation_modal";

interface PaginatedResponse {
  data: Produk[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

type StatusConfig = {
  label: string;
  badgeClass: string;
};

type KategoriStatus = "Brownies" | "Tradisional" | "Cake" | "Tart";

const STATUS_MAP: Record<KategoriStatus, StatusConfig> = {
  Brownies: {
    label: "Brownies",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  Tradisional: {
    label: "Tradisional",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
  Cake: {
    label: "Cake",
    badgeClass: "bg-pink-100 text-pink-800 border-pink-200",
  },
  Tart: {
    label: "Tart",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

function getStatusCfg(status: KategoriStatus): StatusConfig {
  return (
    STATUS_MAP[status] ?? {
      label: status,
      badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
    }
  );
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

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const {
    modal,
    loading: confirmLoading,
    confirm,
    close,
    handleConfirm,
  } = useConfirmModal();

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchKategoris = useCallback(async () => {
    try {
      const res = await api.get("/kategori");
      if (res.data?.success) {
        setKategoris(res.data.data);
      } else if (Array.isArray(res.data?.data)) {
        setKategoris(res.data.data);
      } else if (Array.isArray(res.data)) {
        setKategoris(res.data);
      }
    } catch (err) {
      console.error("Gagal fetch kategori:", err);
    }
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

  useEffect(() => {
    setPage(1);
  }, [search, selectedKategori]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  const handleDelete = (id: number, nama: string) => {
    confirm({
      title: "Hapus Produk",
      message: "Produk yang dihapus tidak dapat dikembalikan. Lanjutkan?",
      detail: nama,
      type: "danger",
      confirmText: "Ya, Hapus",
      onConfirm: async () => {
        await api.delete(`/produk/${id}`);
        showToast("Produk berhasil dihapus.");
        fetchProduk(true);
      },
    });
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

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
        <div className="flex flex-col ">
          {/* Search */}
          <div className="flex">
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
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter kategori */}
        <div className="flex flex-wrap gap-2">
          {kategoris.map((kat) => {
            const cfg = getStatusCfg(kat.nama as KategoriStatus);

            return (
              <button
                key={kat.id}
                onClick={() => setSelectedKategori(String(kat.id))}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  selectedKategori === String(kat.id)
                    ? cfg.badgeClass + " border-current"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400",
                ].join(" ")}
              >
                {kat.nama}
              </button>
            );
          })}
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
                    <ImageWithFallback
                      src={fotoUrl(p.foto)}
                      alt={p.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

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
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
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

      <ConfirmationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        detail={modal.detail}
        type={modal.type}
        confirmText={modal.confirmText}
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onCancel={close}
      />
    </div>
  );
}
