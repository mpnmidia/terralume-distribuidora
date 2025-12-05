"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PageProps = {
  params: { slug: string };
};

export default function NovoProdutoPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = params;

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [autoSku, setAutoSku] = useState(true);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [unit, setUnit] = useState("");
  const [barcode, setBarcode] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/empresa/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          name,
          sku: autoSku ? "" : sku,
          autoSku,
          category,
          description,
          image_url: imageUrl,
          unit,
          barcode,
          active,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Erro ao criar produto.");
      } else {
        const msg = encodeURIComponent(
          `Produto "${name}" criado com sucesso (SKU: ${
            data.sku || "gerado automaticamente"
          })`
        );
        router.push(`/empresa/${slug}/produtos?success=1&msg=${msg}`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Erro inesperado ao criar produto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 text-[11px]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-[14px] font-semibold text-slate-900">
            Novo produto
          </h1>
          <p className="text-[10px] text-slate-500">
            Preencha as informações abaixo para incluir o produto no catálogo
            interno da distribuidora.
          </p>
        </div>
        <Link
          href={`/empresa/${slug}/produtos`}
          className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-[10px] text-slate-800 hover:bg-slate-50"
        >
          Voltar para lista
        </Link>
      </div>

      {errorMsg && (
        <div className="max-w-4xl rounded-md border border-rose-500/70 bg-rose-50 text-rose-900 px-3 py-2">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
      >
        <div className="space-y-1">
          <label className="block text-[10px] font-medium text-slate-800">
            Nome do produto *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] text-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-800">
              SKU / código interno
            </label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              disabled={autoSku}
              placeholder={autoSku ? "Gerado automaticamente" : ""}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] text-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
            />
            <div className="flex items-center gap-1 pt-1">
              <input
                id="autoSku"
                type="checkbox"
                checked={autoSku}
                onChange={(e) => setAutoSku(e.target.checked)}
                className="h-3 w-3"
              />
              <label
                htmlFor="autoSku"
                className="text-[10px] text-slate-700 select-none"
              >
                Gerar SKU automaticamente se marcado.
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-800">
              Categoria
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] text-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-800">
              Unidade (cx, un, kg, etc.)
            </label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-800">
              Código de barras
            </label>
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] text-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-800">
              URL da imagem do produto
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] text-slate-900"
            />
            {imageUrl && (
              <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 p-1.5 text-[9px]">
                <p className="mb-1 text-slate-600">Pré-visualização:</p>
                <div className="h-24 w-24 overflow-hidden rounded-md border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={name || "Pré-visualização"}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-medium text-slate-800">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="ativo"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-3 w-3"
          />
          <label
            htmlFor="ativo"
            className="text-[10px] text-slate-800 select-none"
          >
            Produto ativo no catálogo
          </label>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-emerald-600 px-5 py-2 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar produto"}
          </button>
          <span className="text-[10px] text-slate-500">
            Os produtos ficarão vinculados automaticamente à empresa logada.
          </span>
        </div>
      </form>
    </div>
  );
}