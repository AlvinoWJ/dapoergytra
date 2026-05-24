// import React, { useState } from "react";

// export type Kategori = {
//   id: number;
//   nama: string;
// };

// export type Produk = {
//   id?: number;
//   nama: string;
//   kategori_id: number;
//   // Tambahkan properti lain jika perlu (misal: harga, deskripsi)
// };

// type FormProdukProps = {
//   produk?: Produk;
//   daftarKategori: Kategori[];
//   onSubmit: (data: Produk) => void;
//   labelSubmit?: string;
// };

// export const FormProduk: React.FC<FormProdukProps> = ({
//   produk,
//   daftarKategori,
//   onSubmit,
//   labelSubmit = "Simpan",
// }) => {
//   const [form, setForm] = useState<Produk>({
//     nama: produk?.nama ?? "",
//     kategori_id: produk?.kategori_id ?? 0,
//     // Default field lain di sini
//   });

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit({
//       ...form,
//       kategori_id: Number(form.kategori_id), // pastikan angka
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <div>
//         <label>Nama Produk</label>
//         <input
//           type="text"
//           name="nama"
//           value={form.nama}
//           onChange={handleChange}
//           required
//         />
//       </div>
//       <div>
//         <label>Kategori</label>
//         <select
//           name="kategori_id"
//           value={form.kategori_id}
//           onChange={handleChange}
//           required
//         >
//           <option value={0}>Pilih Kategori</option>
//           {daftarKategori.map((kategori) => (
//             <option key={kategori.id} value={kategori.id}>
//               {kategori.nama}
//             </option>
//           ))}
//         </select>
//       </div>
//       {/* Tambahkan field produk lainnya di sini */}
//       <button type="submit">{labelSubmit}</button>
//     </form>
//   );
// };
