/**
 * Normalizes a product foto value returned by the Laravel API into a fully
 * qualified URL safe to pass to next/image.
 *
 * The API can return three shapes:
 *   1. null / empty string  → return null (caller shows fallback)
 *   2. Full URL             → return as-is   e.g. "https://images.unsplash.com/..."
 *   3. Bare storage path    → prepend storage base  e.g. "produk/abc.png"
 *
 * The storage base is derived from NEXT_PUBLIC_API_URL by stripping the "/api"
 * suffix (or any trailing path segment after the host) and appending "/storage".
 *
 * Example:
 *   NEXT_PUBLIC_API_URL = "http://localhost:8000/api"
 *   storageBase         = "http://localhost:8000/storage"
 *   fotoUrl("produk/abc.png") → "http://localhost:8000/storage/produk/abc.png"
 */

function getStorageBase(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  // Strip trailing "/api" (or "/api/") to get the Laravel root URL
  const base = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  return `${base}/storage`;
}

export function fotoUrl(foto: string | null | undefined): string | null {
  if (!foto) return null;

  // Already a full URL (http / https / blob)
  if (/^https?:\/\//.test(foto) || foto.startsWith("blob:")) {
    return foto;
  }

  // Bare path — build full storage URL
  const clean = foto.startsWith("/") ? foto.slice(1) : foto;
  return `${getStorageBase()}/${clean}`;
}
