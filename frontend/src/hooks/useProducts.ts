import useSWR from "swr";
import { fetcherWithParams } from "@/lib/fetcher";

interface Kategori {
  id: number;
  nama: string;
}

export interface Produk {
  id: number;
  nama: string;
  harga: number;
  foto: string;
  stok: number;
  deskripsi: string;
  kategori_id: number;
  kategori?: Kategori;
}

interface ProdukResponse {
  success: boolean;
  data: {
    data: Produk[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

interface UseProductsOptions {
  kategoriId?: string;
  search?: string;
  perPage?: number;
  page?: number;
}

export function useProducts({
  kategoriId,
  search,
  perPage = 20,
  page = 1,
}: UseProductsOptions = {}) {
  const params: Record<string, unknown> = { per_page: perPage, page };
  if (kategoriId && kategoriId !== "all") params.kategori_id = kategoriId;
  if (search) params.search = search;

  const { data, error, isLoading, mutate } = useSWR<ProdukResponse>(
    ["/produk", params],
    fetcherWithParams,
    {
      keepPreviousData: true,
    },
  );

  return {
    produk: data?.data?.data ?? [],
    pagination: {
      currentPage: data?.data?.current_page ?? 1,
      lastPage: data?.data?.last_page ?? 1,
      total: data?.data?.total ?? 0,
    },
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useBestSellers(limit = 3) {
  const { data, error, isLoading } = useSWR<{
    success: boolean;
    data: Produk[];
  }>(["/produk/best-sellers", { limit }], fetcherWithParams, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    produk: data?.data ?? [],
    isLoading,
    isError: !!error,
  };
}
