import { useState, useEffect } from "react";

interface Kategori {
  id: number;
  nama: string;
}

interface Produk {
  id: number;
  nama: string;
  harga: number | string;
  deskripsi: string | null;
  foto: string | null;
  stok: number;
  kategori_id: number;
}

export interface FormErrors {
  nama?: string;
  harga?: string;
  stok?: string;
  kategori_id?: string;
  foto?: string;
  general?: string;
}

export interface ProductFormState {
  nama: string;
  harga: string;
  stok: string;
  deskripsi: string;
  kategoriId: string;
}

export function useProductForm(
  editProduct: Produk | null,
  kategoris: Kategori[],
  isOpen: boolean,
) {
  const [form, setForm] = useState<ProductFormState>({
    nama: "",
    harga: "",
    stok: "",
    deskripsi: "",
    kategoriId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editProduct) {
      setForm({
        nama: editProduct.nama,
        harga: String(editProduct.harga),
        stok: String(editProduct.stok),
        deskripsi: editProduct.deskripsi ?? "",
        kategoriId: String(editProduct.kategori_id),
      });
    } else {
      setForm({
        nama: "",
        harga: "",
        stok: "",
        deskripsi: "",
        kategoriId: kategoris[0] ? String(kategoris[0].id) : "",
      });
    }
    setErrors({});
  }, [isOpen, editProduct, kategoris]);

  const updateField = (key: keyof ProductFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.nama.trim()) errs.nama = "Nama produk wajib diisi.";
    if (!form.harga || isNaN(Number(form.harga)) || Number(form.harga) < 0)
      errs.harga = "Harga tidak valid.";
    if (!form.stok || isNaN(Number(form.stok)) || Number(form.stok) < 0)
      errs.stok = "Stok tidak valid.";
    if (!form.kategoriId) errs.kategori_id = "Kategori wajib dipilih.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const setFieldError = (field: keyof FormErrors, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const setServerErrors = (serverErrs: Record<string, string[]>) => {
    const errs: FormErrors = {};
    if (serverErrs.nama) errs.nama = serverErrs.nama[0];
    if (serverErrs.harga) errs.harga = serverErrs.harga[0];
    if (serverErrs.stok) errs.stok = serverErrs.stok[0];
    if (serverErrs.kategori_id) errs.kategori_id = serverErrs.kategori_id[0];
    if (serverErrs.foto) errs.foto = serverErrs.foto[0];
    setErrors(errs);
  };

  const reset = () => {
    setForm({
      nama: "",
      harga: "",
      stok: "",
      deskripsi: "",
      kategoriId: kategoris[0] ? String(kategoris[0].id) : "",
    });
    setErrors({});
  };

  return {
    form,
    errors,
    updateField,
    validate,
    setFieldError,
    setServerErrors,
    reset,
  };
}
