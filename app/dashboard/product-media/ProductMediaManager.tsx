"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductRow } from "./page";

type EditableProduct = ProductRow;

type Props = {
  initialProducts: EditableProduct[];
};

export default function ProductMediaManager({ initialProducts }: Props) {
  const [products, setProducts] = useState<EditableProduct[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialProducts[0]?.id ?? null
  );

  const [mainImageUrl, setMainImageUrl] = useState("");
  const [offerImageUrl, setOfferImageUrl] = useState("");
  const [offerActive, setOfferActive] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return products;
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) ||
        (p.sku ?? "").toLowerCase().includes(term)
      );
    });
  }, [products, search]);

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  useEffect(() => {
    if (selected) {
      setMainImageUrl(selected.image_url ?? "");
      setOfferImageUrl(selected.offer_image_url ?? "");
      setOfferActive(Boolean(selected.offer_is_active));
      setMessage(null);
      setError(null);
    }
  }, [selected]);

  async function handleUploadFile(e: any, kind: "main" | "offer") {
    const file: File | undefined = e?.target?.files?.[0];
    if (!file || !selected) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", selected.id);
      formData.append("kind", kind);

      const res = await fetch("/api/upload/product-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Falha ao enviar imagem.");
      }

      const data = await res.json();

      if (kind === "main") {
        setMainImageUrl(data.publicUrl);
      } else {
        setOfferImageUrl(data.publicUrl);
      }

      setMessage(
        "Upload concluído. Clique em 'Salvar alterações' para aplicar no catálogo."
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Erro ao enviar imagem.");
    } finally {
      setSaving(false);
      if (e?.target) {
        e.target.value = "";
      }
    }
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/products/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selected.id,
          image_url: mainImageUrl || null,
          offer_image_url: offerImageUrl || null,
          offer_is_active: offerActive,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Falha ao salvar alterações.");
      }

      const data = await res.json();
      const updated: EditableProduct = data.product;

      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      setMessage("Imagens atualizadas com sucesso.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* Lista de produtos */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 flex flex-col min-h-[480px]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Produtos
          </h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-40 md:w-60 rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-950/40">
          {filteredProducts.length === 0 ? (
            <div className="p-4 text-xs text-slate-500">
              Nenhum produto encontrado.
            </div>
          ) : (
            <ul className="divide-y divide-slate-800 text-xs">
              {filteredProducts.map((product) => {
                const isSelected = product.id === selectedId;
                return (
                  <li
                    key={product.id}
                    className={[
                      "flex items-center gap-3 px-3 py-2 cursor-pointer transition",
                      isSelected
                        ? "bg-emerald-500/10 border-l-2 border-emerald-500/80"
                        : "hover:bg-slate-900/60",
                    ].join(" ")}
                    onClick={() => setSelectedId(product.id)}
                  >
                    <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : product.offer_image_url ? (
                        <img
                          src={product.offer_image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-500 text-center px-1">
                          sem imagem
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-slate-100 text-[13px]">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        {product.sku && <span>Cód: {product.sku}</span>}
                        {product.offer_is_active && (
                          <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-1.5 py-0.5 text-amber-300 text-[10px]">
                            em oferta
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Editor de imagens */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4 min-h-[480px]">
        {!selected ? (
          <p className="text-sm text-slate-400">
            Selecione um produto na lista ao lado para gerenciar as imagens.
          </p>
        ) : (
          <>
            <header className="space-y-1">
              <h2 className="text-sm font-semibold text-slate-100">
                Imagens de: {selected.name}
              </h2>
              <p className="text-xs text-slate-500">
                Veja a imagem atual, envie uma nova pelo botão de upload
                e visualize a miniatura antes de salvar.
              </p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Imagem principal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold text-slate-100">
                    Imagem principal
                  </h3>
                  <label className="text-[11px] inline-flex items-center gap-1 rounded-lg border border-slate-600 px-2 py-0.5 cursor-pointer hover:border-emerald-400 hover:text-emerald-300">
                    <span>Enviar arquivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadFile(e, "main")}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="space-y-1">
                    <p className="text-slate-400">Atual</p>
                    <div className="rounded-lg border border-slate-700 bg-slate-950/60 h-28 flex items-center justify-center overflow-hidden">
                      {selected.image_url ? (
                        <img
                          src={selected.image_url}
                          alt={selected.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-500 px-2 text-center">
                          Sem imagem cadastrada
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400">Nova prévia</p>
                    <div className="rounded-lg border border-emerald-600/60 bg-slate-950/60 h-28 flex items-center justify-center overflow-hidden">
                      {mainImageUrl ? (
                        <img
                          src={mainImageUrl}
                          alt={selected.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-500 px-2 text-center">
                          Envie um arquivo ou cole uma URL abaixo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">
                    URL da imagem principal (opcional)
                  </label>
                  <input
                    type="text"
                    value={mainImageUrl}
                    onChange={(e) => setMainImageUrl(e.target.value)}
                    placeholder="https://... (preenchido automaticamente ao enviar arquivo)"
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Imagem de oferta */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-slate-100">
                      Imagem de oferta / destaque
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOfferActive((v) => !v)}
                      className={[
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition",
                        offerActive
                          ? "border-amber-400 bg-amber-500/10 text-amber-200"
                          : "border-slate-600 bg-slate-900 text-slate-300",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "h-3 w-3 rounded-full border",
                          offerActive
                            ? "border-amber-300 bg-amber-400"
                            : "border-slate-500 bg-slate-800",
                        ].join(" ")}
                      />
                      {offerActive ? "Oferta ativa" : "Oferta desativada"}
                    </button>

                    <label className="text-[11px] inline-flex items-center gap-1 rounded-lg border border-slate-600 px-2 py-0.5 cursor-pointer hover:border-emerald-400 hover:text-emerald-300">
                      <span>Enviar arquivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadFile(e, "offer")}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="space-y-1">
                    <p className="text-slate-400">Atual</p>
                    <div className="rounded-lg border border-slate-700 bg-slate-950/60 h-28 flex items-center justify-center overflow-hidden">
                      {selected.offer_image_url ? (
                        <img
                          src={selected.offer_image_url}
                          alt={selected.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-500 px-2 text-center">
                          Sem imagem de oferta
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400">Nova prévia</p>
                    <div className="rounded-lg border border-emerald-600/60 bg-slate-950/60 h-28 flex items-center justify-center overflow-hidden">
                      {offerImageUrl ? (
                        <img
                          src={offerImageUrl}
                          alt={selected.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-500 px-2 text-center">
                          Envie um arquivo ou cole uma URL abaixo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">
                    URL da imagem de oferta (opcional)
                  </label>
                  <input
                    type="text"
                    value={offerImageUrl}
                    onChange={(e) => setOfferImageUrl(e.target.value)}
                    placeholder="https://... (preenchido automaticamente ao enviar arquivo)"
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Mensagens e ações */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-2">
              <div className="text-[11px]">
                {message && (
                  <p className="text-emerald-400">{message}</p>
                )}
                {error && <p className="text-red-400">{error}</p>}
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selected}
                className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
