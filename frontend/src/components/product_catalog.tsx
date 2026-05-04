import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Image from "next/image";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

const allProducts: Product[] = [
  // Brownies
  {
    id: 1,
    name: "Brownies Coklat Premium",
    price: 75000,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop",
    category: "brownies",
    description:
      "Brownies coklat dengan tekstur lembut dan rasa coklat yang kaya",
  },
  {
    id: 2,
    name: "Brownies Keju",
    price: 80000,
    image:
      "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&h=400&fit=crop",
    category: "brownies",
    description:
      "Perpaduan sempurna brownies coklat dengan topping keju melimpah",
  },
  {
    id: 3,
    name: "Brownies Matcha",
    price: 85000,
    image:
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop",
    category: "brownies",
    description: "Brownies dengan sentuhan matcha Jepang premium",
  },
  // Kue Tradisional
  {
    id: 4,
    name: "Kue Lapis Legit",
    price: 120000,
    image:
      "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop",
    category: "tradisional",
    description: "Lapis legit original dengan 18 lapis yang lembut",
  },
  {
    id: 5,
    name: "Bika Ambon",
    price: 55000,
    image:
      "https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&h=400&fit=crop",
    category: "tradisional",
    description: "Bika ambon khas dengan tekstur bersarang",
  },
  {
    id: 6,
    name: "Kue Putu Ayu",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=400&h=400&fit=crop",
    category: "tradisional",
    description: "Kue putu ayu lembut dengan kelapa parut segar",
  },
  // Cake Modern
  {
    id: 7,
    name: "Red Velvet Cake",
    price: 95000,
    image:
      "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=400&fit=crop",
    category: "cake",
    description: "Red velvet dengan cream cheese frosting yang creamy",
  },
  {
    id: 8,
    name: "Tiramisu Cake",
    price: 110000,
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop",
    category: "cake",
    description: "Tiramisu klasik Italia dengan kopi pilihan",
  },
  {
    id: 9,
    name: "Rainbow Cake",
    price: 100000,
    image:
      "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&h=400&fit=crop",
    category: "cake",
    description: "Cake berlapis warna-warni yang cantik dan lezat",
  },
  // Tart
  {
    id: 10,
    name: "Fruit Tart",
    price: 125000,
    image:
      "https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=400&h=400&fit=crop",
    category: "tart",
    description: "Tart dengan topping buah segar dan custard cream",
  },
  {
    id: 11,
    name: "Cheese Tart",
    price: 90000,
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop",
    category: "tart",
    description: "Tart keju Jepang dengan tekstur lembut dan creamy",
  },
  {
    id: 12,
    name: "Chocolate Tart",
    price: 95000,
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop",
    category: "tart",
    description: "Tart coklat premium dengan ganache yang kaya",
  },
];

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void;
}

export function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts =
    selectedCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

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
          onValueChange={setSelectedCategory}
        >
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-8">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="brownies">Brownies</TabsTrigger>
            <TabsTrigger value="tradisional">Tradisional</TabsTrigger>
            <TabsTrigger value="cake">Cake</TabsTrigger>
            <TabsTrigger value="tart">Tart</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {/* <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    /> */}
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {product.category}
                    </Badge>
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-red-700">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                      <Button
                        onClick={() => onAddToCart(product)}
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
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
