"use client";

import React, { useState } from "react";

export type Product = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  description: string | null;
  unit: string | null;
  unit_price: number | null;
  promo_price: number | null;
  offer_is_active: boolean | null;
  image_url: string | null;
};

type ProductModalProps = {
  product: Product;
  similarProducts: Product[];
  onClose: () => void;
};

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  similarProducts,
  onClose,
}) => {
  const [mainProduct, setMainProduct] = useState<Product>(product);

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "Consulte preço";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const hasOffer =
    mainProduct.offer_is_active &&
    mainProduct.promo_price != null &&
    mainProduct.unit_price != null &&
    mainProduct.promo_price < mainProduct.unit_price;

  const displayPrice =
    mainProduct.unit_price != null || mainProduct.promo_price != null
      ? formatCurrency(
          hasOffer
            ? mainProduct.promo_price!
            : mainProduct.unit_price ?? mainProduct.promo_price!
        )
      : "Consulte preço";

  const handleThumbClick = (p: Product) => {
    setMainProduct(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-2">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
              Detalhes do produto
            </span>
            <h2 className="line-clamp-1 text-sm font-bold text-slate-900">
              {mainProduct.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>

        {/* Conteúdo */}
        <div className="grid gap-4 px-4 py-4 md:grid-cols-[2fr,1.4fr]">
          {/* Imagem principal + thumbs */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 min-h-[260px]">
              {mainProduct.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainProduct.image_url}
                  alt={mainProduct.name}
                  className="max-h-72 w-full object-contain"
                />
              ) : (
                <div className="flex h-60 w-full items-center justify-center text-xs text-slate-400">
                  Sem imagem cadastrada
                </div>
              )}
            </div>

            {/* Thumbs de similares */}
            {similarProducts.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Produtos similares
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {similarProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleThumbClick(p)}
                      className="flex min-w-[120px] max-w-[150px] flex-col items-center rounded-lg border border-slate-200 bg-white p-2 text-left text-[11px] text-slate-700 hover:border-emerald-500"
                    >
                      <div className="mb-1 flex h-16 w-full items-center justify-center overflow-hidden rounded-md bg-slate-50">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Sem imagem
                          </span>
                        )}
                      </div>
                      <div className="line-clamp-2 w-full text-[10px] font-semibold">
                        {p.name}
                      </div>
                      {p.sku && (
                        <div className="mt-1 w-full text-[9px] font-mono text-slate-400">
                          {p.sku}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Informações do produto */}
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Informações do produto
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                <div>
                  <span className="font-semibold">Nome:</span> {mainProduct.name}
                </div>
                {mainProduct.sku && (
                  <div>
                    <span className="font-semibold">Código (SKU):</span>{" "}
                    <span className="font-mono">{mainProduct.sku}</span>
                  </div>
                )}
                {mainProduct.category && (
                  <div>
                    <span className="font-semibold">Categoria:</span>{" "}
                    {mainProduct.category}
                  </div>
                )}
                {mainProduct.unit && (
                  <div>
                    <span className="font-semibold">Unidade:</span>{" "}
                    {mainProduct.unit}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Condições comerciais
              </div>
              <div className="mt-2 text-sm font-bold text-emerald-600">
                {displayPrice}
              </div>
              {hasOffer && mainProduct.unit_price != null && (
                <div className="mt-1 text-[11px] text-slate-500">
                  De{" "}
                  <span className="line-through">
                    {formatCurrency(mainProduct.unit_price)}
                  </span>{" "}
                  por{" "}
                  <span className="font-semibold text-emerald-700">
                    {formatCurrency(mainProduct.promo_price)}
                  </span>
                </div>
              )}
              <p className="mt-2 text-[11px] text-slate-500">
                Valores e condições podem variar de acordo com região, volume e
                negociação comercial. Entre em contato com o representante para
                uma proposta formal.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Descrição
              </div>
              <p className="mt-2 text-xs text-slate-600">
                {mainProduct.description ||
                  "Descrição detalhada do produto ainda não cadastrada."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
