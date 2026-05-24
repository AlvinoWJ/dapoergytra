import { useState, useRef, useEffect } from "react";

export function useFileUpload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const setInitialPreview = (url: string | null) => {
    setFotoFile(null);
    setFotoPreview(url);
  };

  const reset = () => {
    setFotoFile(null);
    setFotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const triggerFileDialog = () => {
    fileRef.current?.click();
  };

  return {
    fileRef,
    fotoFile,
    fotoPreview,
    handleFile,
    setInitialPreview,
    reset,
    triggerFileDialog,
  };
}
