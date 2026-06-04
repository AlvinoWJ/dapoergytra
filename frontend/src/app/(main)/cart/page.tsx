"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Minus, Plus, X, ShoppingBag } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { fotoUrl } from "@/lib/foto";
import { useCartContext } from "@/components/cart/cart_provider";
import { useEffect, useState } from "react";
import { CartItemSkeleton, CartSummarySkeleton } from "@/components/skleton";

function QuantityInput({
  itemId,
  quantity,
  onUpdate,
}: {
  itemId: number;
  quantity: number;
  onUpdate: (id: number, qty: number) => void;
}) {
  const [inputValue, setInputValue] = useState(String(quantity));

  // Keep in sync if quantity changes externally (e.g. optimistic update)
  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  const commit = (raw: string) => {
    const parsed = parseInt(raw, 10);
    const valid = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    setInputValue(String(valid));
    if (valid !== quantity) onUpdate(itemId, valid);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={quantity <= 1}
        onClick={() => {
          const next = Math.max(1, quantity - 1);
          setInputValue(String(next));
          onUpdate(itemId, next);
        }}
      >
        <Minus className="h-4 w-4" />
      </Button>

      <input
        type="number"
        min="1"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          const parsed = parseInt(e.target.value, 10);
          if (!isNaN(parsed) && parsed >= 1) onUpdate(itemId, parsed);
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="w-16 text-center rounded-xl border border-slate-200 bg-slate-50 py-1.5 text-sm font-semibold outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200
          [appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none"
      />

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          const next = quantity + 1;
          setInputValue(String(next));
          onUpdate(itemId, next);
        }}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    loading: cartLoading,
  } = useCartContext();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  const isLoading = !ready || cartLoading;

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold">Keranjang Belanja</h1>
          <p className="text-gray-600 mt-2">
            {totalItems} item dalam keranjang Anda
          </p>
        </div>

        {isLoading && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <div className="lg:col-span-1">
              <CartSummarySkeleton />
            </div>
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Keranjang Kosong</h2>
            <p className="text-gray-600 mb-6">
              Belum ada produk di keranjang Anda
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-red-600 hover:bg-red-700"
            >
              Mulai Belanja
            </Button>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left — item list */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0 relative">
                        <ImageWithFallback
                          src={fotoUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mt-1"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-lg font-bold text-red-700 mb-4">
                          Rp {Number(item.price).toLocaleString("id-ID")}
                        </p>
                        <div className="flex items-center justify-between">
                          <QuantityInput
                            itemId={item.id}
                            quantity={item.quantity}
                            onUpdate={updateQuantity}
                          />
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Subtotal</p>
                            <p className="font-bold text-lg">
                              Rp{" "}
                              {(item.price * item.quantity).toLocaleString(
                                "id-ID",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right — summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Ringkasan Belanja
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Item</span>
                      <span className="font-semibold">{totalItems} item</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ongkir</span>
                      <span className="text-red-600">
                        Dihitung saat checkout
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-red-700">
                        Rp {total.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push("/checkout")}
                    className="w-full bg-red-600 hover:bg-red-700 mt-6"
                    size="lg"
                  >
                    Lanjut ke Checkout
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="w-full mt-3"
                  >
                    Lanjut Belanja
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
