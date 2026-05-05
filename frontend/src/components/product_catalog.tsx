import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Image from "next/image";

export interface Kategori {
  id: number;
  nama_kategori: string;
}

export interface Produk {
  id: number;
  nama_produk: string;
  harga: number;
  foto: string;
  kategori?: Kategori;
  deskripsi: string;
  stok: number;
  kategori_id: number;
}

const kategori_tabs = [
  { value: "all", label: "Semua" },
  { value: "1", label: "Brownies" },
  { value: "2", label: "Tradisional" },
  { value: "3", label: "Cake" },
  { value: "4", label: "Tart" },
];

interface ProductCatalogProps {
  onAddToCart: (produk: Produk) => void;
}

export function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [loadingProduk, setLoadingProduk] = useState(false);

  useEffect(() => {
    async function fetchProduk() {
      setLoadingProduk(true);
      try {
        const params = new URLSearchParams({ per_page: "20" });
        if (selectedKategori !== "all") {
          params.set("kategori_id", selectedKategori);
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/produk?${params}`,
          { headers: { Accept: "application/json" } },
        );
        const json = await res.json();
        if (json.success) {
          setProduk(json.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      } finally {
        setLoadingProduk(false);
        setLoading(false);
      }
    }
    fetchProduk();
  }, [selectedKategori]);

  const skeletonCount = 8;

  return (
    <section id="catalog" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Katalog Produk
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Jelajahi semua koleksi kue kami yang lezat
          </p>
        </div>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={setSelectedKategori}
        >
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-8">
            {kategori_tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedKategori} className="mt-0">
            {loading || loadingProduk ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
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
                ))}
              </div>
            ) : produk.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg font-medium">Belum ada produk</p>
                <p className="text-sm mt-1">
                  Produk untuk kategori ini belum tersedia.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {produk.map((produk) => (
                  <Card
                    key={produk.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      {produk.foto ? (
                        <Image
                          src={produk.foto}
                          alt={produk.nama_produk}
                          fill
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                          🎂
                        </div>
                      )}
                      {produk.stok === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold bg-red-600 px-3 py-1 rounded-full">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {produk.kategori?.nama_kategori ?? produk.kategori_id}
                      </Badge>
                      <h3 className="font-semibold mb-1">
                        {produk.nama_produk}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {produk.deskripsi}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-red-700">
                          Rp {produk.harga.toLocaleString("id-ID")}
                        </span>
                        <Button
                          onClick={() => onAddToCart(produk)}
                          size="sm"
                          disabled={produk.stok === 0}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          + Keranjang
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
