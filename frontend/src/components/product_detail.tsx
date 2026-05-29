import { Dialog, DialogHeader, DialogContent, DialogTitle } from "./ui/dialog";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Minus, Plus } from "lucide-react";
import { Kategori } from "./product_catalog";
import { fotoUrl } from "@/lib/foto";

interface Produk {
  id: number;
  nama: string;
  harga: number;
  foto: string;
  kategori?: Kategori;
  deskripsi: string;
}

interface ProductDetailModalProps {
  open: boolean;
  onClose: () => void;
  Produk: Produk | null;
  onAddToCart: (product: Produk, quantity: number) => void;
}

export function ProductDetailModal({
  open,
  onClose,
  Produk,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  // Separate display value so the field can be cleared while typing
  const [inputValue, setInputValue] = useState("1");

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setInputValue("1");
    }
  }, [Produk?.id, open]);

  if (!Produk) return null;

  const decrement = () => {
    const next = Math.max(1, quantity - 1);
    setQuantity(next);
    setInputValue(String(next));
  };

  const increment = () => {
    const next = quantity + 1;
    setQuantity(next);
    setInputValue(String(next));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 1) setQuantity(parsed);
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10);
    const valid = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    setQuantity(valid);
    setInputValue(String(valid));
  };

  const handleAddToCart = () => {
    onAddToCart(Produk, quantity);
    setQuantity(1);
    setInputValue("1");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detail Produk</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <ImageWithFallback
              src={fotoUrl(Produk.foto)}
              alt={Produk.nama}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {Produk.kategori?.nama}
              </Badge>
              <h2 className="text-2xl font-bold mb-2">{Produk.nama}</h2>
              <p className="text-3xl font-bold text-red-700">
                Rp {Number(Produk.harga).toLocaleString("id-ID")}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Deskripsi</h3>
              <p className="text-gray-600">{Produk.deskripsi}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Informasi Produk</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Dibuat dengan bahan-bahan premium</li>
                <li>• Diproduksi fresh setiap hari</li>
                <li>• Kemasan aman dan higienis</li>
                <li>• Tahan 3-5 hari di suhu ruang</li>
                <li>• Dapat disimpan di kulkas hingga 2 minggu</li>
              </ul>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div>
              <h3 className="font-semibold mb-3">Jumlah</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrement}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <input
                  type="number"
                  min="1"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="w-16 text-center rounded-xl border border-slate-200 bg-slate-50 py-2 text-base font-semibold outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200
                    [appearance:textfield]
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none"
                />

                <Button variant="outline" size="icon" onClick={increment}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Subtotal */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Subtotal</span>
                <span className="text-xl font-bold text-red-700">
                  Rp {(Number(Produk.harga) * quantity).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              Tambah ke Keranjang
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
