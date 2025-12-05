"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductRow } from "./page";

type Props = {
  initialProducts: ProductRow[];
};

type UploadRole = "main" | "offer";

export default function ProductMediaManager({ initialProducts }: Props) {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialProducts[0]?.id ?? null
  );

  const [mainImageUrl, setMainImageUrl] = useState<string>("");
  const [offerImageUrl, setOfferImageUrl] = useState<string>("");

  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [previewOffer, setPreviewOffer] = useState<string | null>(null);

  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingOffer, setIsUploadingOffer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentProduct = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  useEffect(() => {
    if (!currentProduct) return;
    setMainImageUrl(currentProduct.image_url ?? "");
    setOfferImageUrl(currentProduct.offer_image_url ?? "");
    setPreviewMain(null);
    setPreviewOffer(null);
    setStatusMessage(null);
    setErrorMessage(null);
  }, [currentProduct]);

  function showTempMessage(msg: string, isError = false) {
    if (isError) {
      setErrorMessage(msg);
      setStatusMessage(null);
    } else {
      setStatusMessage(msg);
      setErrorMessage(null);
    }
    setTimeout(() => {
      setStatusMessage(null);
      setErrorMessage(null);
    }, 5000);
  }

  async function handleFileChange(role: UploadRole, e: React.ChangeEvent<HTMLInputElement>) {
    if (!currentProduct) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const productId = currentProduct.id;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);
    formData.append("role", role);

    try {
      if (role === "main") setIsUploadingMain(true);
      else setIsUploadingOffer(true);

      console.log("[product-media] Enviando arquivo para /api/product-images/upload...");
      const res = await fetch("/api/product-images/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      console.log("[product-media] Resposta do upload:", json);

      if (!res.ok) {
        showTempMessage(json?.error ?? "Erro ao enviar arquivo para Storage.", true);
        return;
      }

      const publicUrl = json.publicUrl as string;

      if (role === "main") {
        setPreviewMain(publicUrl);
        setMainImageUrl(publicUrl);
      } else {
        setPreviewOffer(publicUrl);
        setOfferImageUrl(publicUrl);
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                image_url: role === "main" ? publicUrl : p.image_url,
                offer_image_url: role === "offer" ? publicUrl : p.offer_image_url,
              }
            : p
        )
      );

      showTempMessage("Imagem enviada e vinculada ao produto com sucesso.");
    } catch (err: any) {
      console.error("[product-media] Erro inesperado no upload:", err);
      showTempMessage("Erro inesperado ao enviar arquivo.", true);
    } finally {
      if (role === "main") setIsUploadingMain(false);
      else setIsUploadingOffer(false);
      e.target.value = "";
    }
  }

  async function handleSaveUrls() {
    if (!currentProduct) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/product-images/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: currentProduct.id,
          image_url: mainImageUrl || null,
          offer_image_url: offerImageUrl || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("[product-media] Erro ao salvar URLs:", json);
        showTempMessage(json?.error ?? "Erro ao salvar URLs de imagem.", true);
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === currentProduct.id
            ? {
                ...p,
                image_url: mainImageUrl || null,
                offer_image_url: offerImageUrl || null,
              }
            : p
        )
      );

      showTempMessage("Alterações salvas com sucesso.");
    } catch (err) {
      console.error("[product-media] Erro inesperado ao salvar URLs:", err);
      showTempMessage("Erro inesperado ao salvar alterações.", true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">
          Painel de imagens dos produtos
        </p>
        <h1 className="text-2xl font-semibold text-slate-100">
          Painel de imagens dos produtos
        </h1>
        <p className="text-sm text-slate-400">
          Gerencie as imagens principais e de oferta dos produtos do catálogo B2B.
        </p>
      </header>

      <details className="rounded-xl border border-slate-800 bg-slate-900/70">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-slate-100">
          <span>Orientações para imagens do catálogo</span>
          <span className="text-[11px] text-slate-500">clique para abrir</span>
        </summary>
        <div className="border-t border-slate-800 px-4 py-4 text-xs text-slate-200 space-y-2">
          <p>
            Para manter o catálogo bonito, rápido e padronizado, siga estas recomendações ao
            preparar as imagens antes do upload:
          </p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Prefira JPG/PNG, com lado maior entre 800 e 1200px.</li>
            <li>Tamanho ideal: até ~300 KB por imagem.</li>
            <li>Fundo claro, produto centralizado e nítido.</li>
          </ul>
        </div>
      </details>

      <div className="grid gap-6 lg:grid-cols-[ minmax(0,260px) minmax(0,1fr) ]">
        <section className="rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-4 py-3">
            <p className="text-xs font-medium text-slate-200">Produtos</p>
            <p className="text-[11px] text-slate-500">
              Selecione um produto para gerenciar as imagens.
            </p>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {products.length === 0 && (
              <p className="p-4 text-[11px] text-slate-500">
                Nenhum produto encontrado. Importe itens pelo módulo de Produtos.
              </p>
            )}
            {products.map((p) => {
              const isActive = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={[
                    "flex w-full items-center gap-3 border-b border-slate-800 px-4 py-3 text-left text-xs transition",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-100"
                      : "bg-transparent text-slate-200 hover:bg-slate-800/60",
                  ].join(" ")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-[10px] text-slate-400">
                    {p.image_url ? "img" : "sem imagem"}
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-2 font-medium">{p.name}</p>
                    {p.sku && (
                      <p className="text-[10px] text-slate-500">
                        código: <span className="font-mono">{p.sku}</span>
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-6">
          {!currentProduct ? (
            <p className="text-sm text-slate-400">
              Selecione um produto na lista ao lado para gerenciar as imagens.
            </p>
          ) : (
            <>
              <header className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-100">
                  Imagens de: {currentProduct.name}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Veja a imagem atual, envie uma nova pelo botão de upload e visualize a miniatura
                  antes de salvar.
                </p>
              </header>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-100">
                      Imagem principal
                    </p>
                    <label className="inline-flex cursor-pointer items-center rounded-md bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-100 hover:bg-slate-700">
                      {isUploadingMain ? "Enviando..." : "Enviar arquivo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange("main", e)}
                        disabled={isUploadingMain}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-400 flex flex-col items-center justify-center">
                      <p className="mb-2 font-semibold text-slate-300">Atual</p>
                      {currentProduct.image_url ? (
                        <img
                          src={currentProduct.image_url}
                          alt={currentProduct.name}
                          className="h-28 w-auto rounded-md object-contain"
                        />
                      ) : (
                        <p>Sem imagem cadastrada</p>
                      )}
                    </div>
                    <div className="rounded-lg border border-emerald-700/60 bg-slate-950/60 p-3 text-[11px] text-slate-400 flex flex-col items-center justify-center">
                      <p className="mb-2 font-semibold text-emerald-300">
                        Nova prévia
                      </p>
                      {previewMain ? (
                        <img
                          src={previewMain}
                          alt="Prévia da nova imagem"
                          className="h-28 w-auto rounded-md object-contain"
                        />
                      ) : mainImageUrl ? (
                        <img
                          src={mainImageUrl}
                          alt="Prévia da nova imagem"
                          className="h-28 w-auto rounded-md object-contain"
                        />
                      ) : (
                        <p>Envie um arquivo ou cole uma URL abaixo</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-slate-300">
                      URL da imagem principal (opcional)
                    </p>
                    <input
                      type="text"
                      value={mainImageUrl}
                      onChange={(e) => setMainImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-100">
                      Imagem de oferta / destaque
                    </p>
                    <label className="inline-flex cursor-pointer items-center rounded-md bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-100 hover:bg-slate-700">
                      {isUploadingOffer ? "Enviando..." : "Enviar arquivo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange("offer", e)}
                        disabled={isUploadingOffer}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-400 flex flex-col items-center justify-center">
                      <p className="mb-2 font-semibold text-slate-300">Atual</p>
                      {currentProduct.offer_image_url ? (
                        <img
                          src={currentProduct.offer_image_url}
                          alt={currentProduct.name}
                          className="h-28 w-auto rounded-md object-contain"
                        />
                      ) : (
                        <p>Sem imagem de oferta</p>
                      )}
                    </div>
                    <div className="rounded-lg border border-emerald-700/60 bg-slate-950/60 p-3 text-[11px] text-slate-400 flex flex-col items-center justify-center">
                      <p className="mb-2 font-semibold text-emerald-300">
                        Nova prévia
                      </p>
                      {previewOffer ? (
                        <img
                          src={previewOffer}
                          alt="Prévia da nova imagem de oferta"
                          className="h-28 w-auto rounded-md object-contain"
                        />
                      ) : offerImageUrl ? (
                        <img
                          src={offerImageUrl}
                          alt="Prévia da nova imagem de oferta"
                          className="h-28 w-auto rounded-md object-contain"
                        />
                      ) : (
                        <p>Envie um arquivo ou cole uma URL abaixo</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-slate-300">
                      URL da imagem de oferta (opcional)
                    </p>
                    <input
                      type="text"
                      value={offerImageUrl}
                      onChange={(e) => setOfferImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-1 text-[11px]">
                  {statusMessage && (
                    <p className="text-emerald-300">{statusMessage}</p>
                  )}
                  {errorMessage && (
                    <p className="text-red-400">{errorMessage}</p>
                  )}
                  {!statusMessage && !errorMessage && (
                    <p className="text-slate-500">
                      Dica: envie a imagem pelo botão de upload para preencher automaticamente a URL,
                      depois clique em "Salvar alterações".
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSaveUrls}
                  disabled={isSaving || !currentProduct}
                  className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
