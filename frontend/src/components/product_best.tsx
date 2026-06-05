import { Star } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useBestSellers } from "@/hooks/useProducts";
import { fotoUrl } from "@/lib/foto";

interface Product {
  id: number;
  nama: string;
  harga: number;
  foto: string;
  deskripsi: string;
  rating?: number;
  sold?: number;
}

interface BestProductsProps {
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

export function BestProducts({
  onAddToCart,
  onProductClick,
}: BestProductsProps) {
  const { produk, isLoading } = useBestSellers(3);

  return (
    <section id="best-products" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-800 hover:bg-red-100">
            Terlaris
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Produk Terbaik Kami
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pilihan favorit pelanggan yang paling banyak dipesan
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-100 rounded" />
                  <div className="flex justify-between pt-1">
                    <div className="h-6 w-24 bg-gray-200 rounded" />
                    <div className="h-8 w-28 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {produk.map((p) => {
              const foto = fotoUrl(p.foto) ?? p.foto;
              return (
                <Card
                  key={p.id}
                  onClick={() => onProductClick?.(p)}
                  className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <ImageWithFallback
                      src={fotoUrl(p.foto)}
                      alt={p.nama}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 right-4 bg-red-600">
                      <Star className="h-3 w-3 fill-white mr-1" />
                      Terlaris
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{p.nama}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-red-700">
                        Rp {Number(p.harga).toLocaleString("id-ID")}
                      </span>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(p);
                        }}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        + Keranjang
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
