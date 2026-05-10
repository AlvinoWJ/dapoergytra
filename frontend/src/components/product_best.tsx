import { Star } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface Product {
  id: number;
  nama: string;
  harga: number;
  foto: string;
  rating: number;
  sold: number;
}

const bestProducts: Product[] = [
  {
    id: 1,
    nama: "Brownies Coklat Premium",
    harga: 75000,
    foto: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop",
    rating: 4.9,
    sold: 523,
  },
  {
    id: 2,
    nama: "Kue Lapis Legit",
    harga: 120000,
    foto: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop",
    rating: 4.8,
    sold: 412,
  },
  {
    id: 3,
    nama: "Red Velvet Cake",
    harga: 95000,
    foto: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=400&fit=crop",
    rating: 4.9,
    sold: 389,
  },
];

interface BestProductsProps {
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

export function BestProducts({
  onAddToCart,
  onProductClick,
}: BestProductsProps) {
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

        <div className="grid md:grid-cols-3 gap-8">
          {bestProducts.map((product) => (
            <Card
              key={product.id}
              onClick={() => onProductClick?.(product)}
              className="overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={product.foto}
                  alt={product.nama}
                  fill
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 right-4 bg-red-600">
                  <Star className="h-3 w-3 fill-white mr-1" />
                  {product.rating}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">{product.nama}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {product.sold} terjual
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-red-700">
                    Rp {product.harga.toLocaleString("id-ID")}
                  </span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    + Keranjang
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
