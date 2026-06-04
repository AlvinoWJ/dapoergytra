import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ── Checkout ─────────────────────────────────────────── */
export function FormSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="h-6 w-48 bg-gray-200 rounded mb-5" />
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-11 w-full bg-gray-100 rounded-xl" />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-20 w-full bg-gray-100 rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-14 w-full bg-gray-100 rounded-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="h-6 w-44 bg-gray-200 rounded mb-5" />
        <div className="h-16 w-full bg-gray-100 rounded-xl" />
        <div className="h-3 w-3/4 bg-gray-100 rounded mt-3" />
      </CardContent>
    </Card>
  );
}

export function SummarySkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="h-6 w-44 bg-gray-200 rounded mb-4" />
        <div className="flex flex-col gap-3 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 rounded-md bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/4 bg-gray-100 rounded" />
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
          <Separator className="my-1" />
          <div className="flex justify-between">
            <div className="h-5 w-12 bg-gray-200 rounded" />
            <div className="h-5 w-28 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="mt-6 hidden lg:flex flex-col gap-3">
          <div className="h-10 w-full bg-gray-200 rounded-md" />
          <div className="h-10 w-full bg-gray-100 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Cart ──────────────────────────────────────────────── */
export function CartItemSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-md bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded" />
                <div className="h-5 w-8 bg-gray-200 rounded" />
                <div className="h-8 w-8 bg-gray-200 rounded" />
              </div>
              <div className="h-5 w-28 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CartSummarySkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6 space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex justify-between">
          <div className="h-6 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-28 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-full bg-gray-200 rounded-md" />
        <div className="h-10 w-full bg-gray-100 rounded-md" />
      </CardContent>
    </Card>
  );
}

/* ── Orders ────────────────────────────────────────────── */
export function OrderSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="flex justify-between mb-4">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-44 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-36 bg-gray-200 rounded-full" />
        </div>
        <Separator className="my-4" />
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-1/4 bg-gray-100 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Admin Orders ──────────────────────────────────────── */
export function AdminOrderSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="flex justify-between mb-4">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-32 bg-gray-200 rounded-full" />
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between items-center">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-32 bg-gray-200 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Admin Products ────────────────────────────────────── */
export function AdminProductSkeleton() {
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

/* ── Admin Dashboard Stats ─────────────────────────────── */
export function AdminStatSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Product Catalog ───────────────────────────────────── */
export function ProductCatalogSkeleton() {
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

/* ── Best Products ─────────────────────────────────────── */
export function BestProductSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
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
  );
}
