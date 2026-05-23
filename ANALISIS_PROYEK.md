# Analisis Proyek Dapoergytra

Dokumen ini merangkum struktur proyek agar bisa dipahami oleh model AI lain tanpa harus membaca seluruh source code terlebih dahulu.

## Ringkasan Singkat

Dapoergytra adalah aplikasi toko kue dengan arsitektur terpisah:

- Backend: Laravel API untuk autentikasi, katalog produk, keranjang, checkout, pesanan, admin, dan webhook pembayaran.
- Frontend: Next.js App Router untuk UI pelanggan dan admin.
- Integrasi pembayaran: Xendit invoice dengan fokus QRIS.

Alur utamanya adalah pelanggan login, menambah produk ke keranjang, checkout, lalu menerima invoice pembayaran. Setelah pembayaran berhasil, webhook Xendit memperbarui status pesanan di backend.

Secara fisik, repository ini adalah monorepo sederhana dengan dua folder utama:

- `backend` untuk API Laravel.
- `frontend` untuk aplikasi Next.js.

## Stack Teknologi

### Backend

- Laravel 13
- PHP 8.3
- Sanctum untuk token authentication
- Xendit untuk invoice dan webhook pembayaran

### Frontend

- Next.js 16 dengan React 19
- TypeScript
- Tailwind CSS v4
- axios untuk request API
- shadcn/ui style components
- Recharts untuk dashboard admin

## Struktur Proyek

Struktur berikut adalah gambaran tingkat atas dari repository ini.

```text
Dapoergytra/
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/
│   │   ├── Models/
│   │   ├── Providers/
│   │   └── services/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   │   ├── factories/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   └── tests/
└── frontend/
	├── public/
	├── src/
	│   ├── app/
	│   │   ├── (main)/
	│   │   │   ├── cart/
	│   │   │   ├── checkout/
	│   │   │   ├── dashboard/
	│   │   │   └── orders/
	│   │   ├── admin/
	│   │   ├── login/
	│   │   └── register/
	│   ├── components/
	│   │   ├── cart/
	│   │   ├── toast/
	│   │   └── ui/
	│   ├── hooks/
	│   └── lib/
	└── AGENTS.md
```

## Struktur Backend

Backend berfokus sebagai API. Route utama ada di `backend/routes/api.php`.

### Area Fungsional

- Auth publik: register dan login.
- Katalog publik: kategori dan produk dapat dibaca tanpa login.
- Area pelanggan terautentikasi: profil user, logout, keranjang, checkout, daftar pesanan, detail pesanan, dan cancel pesanan.
- Area admin: CRUD kategori dan produk, ubah status pesanan, daftar customer, dan daftar semua pesanan.
- Webhook Xendit: menerima callback status invoice.

### Model Data Utama

- `User`: akun pelanggan dan admin, dengan kolom `role`.
- `Kategori`: kategori produk.
- `Produk`: nama, harga, deskripsi, foto, stok, dan relasi ke kategori.
- `Keranjang`: satu keranjang per user.
- `DetailKeranjang`: item dalam keranjang.
- `Pesanan`: header transaksi, termasuk alamat, ongkir, total, status, dan data invoice Xendit.
- `DetailPesanan`: snapshot item saat checkout, termasuk harga satuan dan subtotal baris.

### Relasi Domain

- Satu `User` memiliki satu `Keranjang` dan banyak `Pesanan`.
- Satu `Keranjang` punya banyak `DetailKeranjang`.
- Satu `Pesanan` punya banyak `DetailPesanan`.
- Satu `Kategori` punya banyak `Produk`.
- Satu `Produk` bisa muncul di banyak detail keranjang dan detail pesanan.

### Karakteristik Implementasi Backend

- Checkout memakai transaksi database dan `lockForUpdate()` pada stok produk untuk mencegah race condition saat stok dikurangi.
- Stok dikurangi ketika pesanan dibuat.
- Jika pesanan dibatalkan atau invoice expired, stok dikembalikan.
- Invoice Xendit dibuat setelah transaksi database selesai, supaya kegagalan Xendit tidak membatalkan data pesanan yang sudah terbentuk.
- Webhook divalidasi dengan callback token dari config Xendit.

### File Penting Backend

- `backend/routes/api.php`: definisi seluruh endpoint API.
- `backend/app/Http/Controllers/Api/CheckoutController.php`: inti proses checkout dan pembuatan invoice.
- `backend/app/Http/Controllers/Api/PesananController.php`: daftar, detail, cancel, dan update status pesanan.
- `backend/app/Http/Controllers/Api/XenditWebhookController.php`: sinkronisasi status pembayaran dari Xendit.
- `backend/app/Services/XenditService.php`: client utama untuk Xendit.
- `backend/app/Models/`: model domain dan relasi Eloquent.
- `backend/database/migrations/`: definisi tabel dan constraint relasional.

## Struktur Frontend

Frontend memakai App Router dan dibagi menjadi dua area utama:

- Area publik/pelanggan di `frontend/src/app/(main)`.
- Area admin di `frontend/src/app/admin`.

### Pola State dan API

- `frontend/src/lib/api.ts` adalah axios client utama.
- Token disimpan di `localStorage` dan otomatis disisipkan ke header Authorization.
- Response 401 memicu redirect ke halaman login.
- Keranjang dikelola lewat React context di `frontend/src/components/cart/cart_provider.tsx` dan hook `use_cart.tsx`.

### Halaman Pelanggan

- `dashboard`: landing utama, hero, produk terbaik, katalog, about, dan modal detail produk.
- `cart`: ringkasan item belanja dan pengaturan jumlah.
- `checkout`: form pengiriman dan konfirmasi pesanan.
- `orders`: riwayat pesanan, status, tautan bayar, dan batal pesanan.
- `login` dan `register`: autentikasi pelanggan.

### Halaman Admin

- `admin/login`: login admin, lalu menyimpan flag `adminAuth` di localStorage.
- `admin/dashboard`: menampilkan KPI, grafik, dan ringkasan pesanan menggunakan data API.

### File Penting Frontend

- `frontend/src/lib/api.ts`: axios client dan interceptor token/401.
- `frontend/src/components/cart/cart_provider.tsx`: context keranjang global.
- `frontend/src/hooks/use_cart.tsx`: logika mengambil, menambah, dan mengubah keranjang.
- `frontend/src/components/app_wrapper.tsx`: wrapper layout utama untuk navbar, footer, dan auth state.
- `frontend/src/app/(main)/dashboard/page.tsx`: halaman utama pelanggan.
- `frontend/src/app/(main)/checkout/page.tsx`: checkout dan redirect ke invoice Xendit.
- `frontend/src/app/(main)/orders/page.tsx`: histori pesanan dan status pembayaran.
- `frontend/src/app/admin/dashboard/page.tsx`: dashboard analitik admin.

## Alur Bisnis End-to-End

1. User register atau login lewat `/auth/register` atau `/auth/login`.
2. Frontend menyimpan token Sanctum di localStorage.
3. User melihat katalog produk dari endpoint publik `/produk` dan `/produk/best-sellers`.
4. Item yang dipilih masuk ke keranjang melalui endpoint `/keranjang`.
5. Saat checkout, frontend mengirim data penerima ke `/checkout`.
6. Backend membuat `pesanan`, `detail_pesanan`, mengurangi stok, lalu membuat invoice Xendit.
7. Frontend mengarahkan user ke URL invoice Xendit.
8. Xendit mengirim webhook ke `/xendit/webhook`.
9. Backend memperbarui status pesanan menjadi `diproses` saat lunas, atau `dibatalkan` saat expired.
10. User dapat melihat histori pesanan di `/pesanan`.

## Observasi Teknis Penting

- Backend dan frontend dipisah jelas, jadi integrasi sangat bergantung pada konsistensi payload API.
- Admin authorization tidak hanya bergantung pada server; frontend juga memakai flag `adminAuth` di localStorage untuk guard UI.
- Beberapa komponen frontend masih memakai data yang di-hardcode, misalnya tab kategori produk berdasarkan ID tetap.
- `admin_topbar.tsx` masih bersifat visual dan belum terhubung ke data backend nyata.
- UI pelanggan dan admin sudah cukup jauh dari template default, tetapi beberapa halaman masih menyimpan pola prototipe atau placeholder.

## Kelebihan Arsitektur

- Struktur domain inti sudah jelas: produk, keranjang, pesanan, dan pembayaran.
- Checkout sudah memakai transaksi database dan pengecekan stok.
- Ada mekanisme pengembalian stok untuk pembatalan dan invoice expired.
- Ada pemisahan antara public API dan area admin.

## Risiko Dan Titik Yang Perlu Diperhatikan

- Client-side auth masih sangat bergantung pada localStorage, jadi guard UI tidak cukup sebagai kontrol keamanan utama.
- Beberapa tipe data frontend tidak sepenuhnya selaras dengan backend, misalnya tipe `metode_pembayaran` di halaman order yang masih mencantumkan opsi selain QRIS.
- Tab kategori di frontend masih memakai ID statis, sehingga perubahan seed kategori di backend bisa membuat UI tidak akurat.
- `User` di frontend belum selalu diambil dari endpoint profil, sehingga nama yang ditampilkan masih bisa fallback ke nilai generik.
- Lapis admin dashboard memakai data agregat dari endpoint pesanan, produk, dan user; jika salah satu endpoint berubah, ringkasan dashboard bisa ikut rusak.

## Gambaran Data Model Singkat

```text
User 1 --- 1 Keranjang 1 --- * DetailKeranjang * --- 1 Produk * --- 1 Kategori
User 1 --- * Pesanan 1 --- * DetailPesanan * --- 1 Produk
```

## Kesimpulan

Proyek ini adalah e-commerce toko kue dengan backend Laravel yang menangani data transaksi dan pembayaran, sementara frontend Next.js menangani pengalaman belanja, checkout, dan dashboard admin. Secara arsitektural, fondasinya sudah cukup jelas dan bisa dikembangkan lebih lanjut, tetapi ada beberapa ketergantungan hardcode dan guard berbasis localStorage yang sebaiknya diselaraskan jika proyek ini akan diproduksi.
