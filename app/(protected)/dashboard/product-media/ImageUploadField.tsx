"use client";

import { useState } from "react";

interface Props {
  productId: string;
  role?: "main" | "offer";
  onUploaded?: (url: string) => void;
}

export default function ImageUploadField({ productId, role = "main", onUploaded }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);
    formData.append("role", role);

    try {
      const res = await fetch("/api/product-images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar arquivo.");
      } else if (data.publicUrl) {
        onUploaded?.(data.publicUrl);
      }
    } catch (err: any) {
      setError((err as Error).message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {loading && <p>Enviando imagem...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-2 h-32 rounded border border-slate-600 object-cover"
        />
      )}
    </div>
  );
}
