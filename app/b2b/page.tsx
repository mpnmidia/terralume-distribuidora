"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  sku?: string | null;
  image_url?: string | null;
  is_offer?: boolean | null;
  category_name?: string | null;
};

type LoadState = "idle" | "loading" | "error";

type CartItem = {
  productId: string;
  name: string;
  sku?: string;
  quantity: number;
};

export default function B2BCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  // Carrega catálogo
  useEffect(() => {
    async function load() {
      setLoadState("loading");
      setErrorMsg(null);
      try {
        const res = await fetch("/api/b2b/catalog");
        const json = await res.json();
        if (!res.ok || !json?.ok) {
          setLoadState("error");
          setErrorMsg(
            json?.error || "Não foi possível carregar o catálogo B2B. Tente novamente mais tarde."
          );
          return;
        }
        setProducts(json.products || []);
        setLoadState("idle");
      } catch (err) {
        console.error("Erro ao carregar catálogo B2B:", err);
        setLoadState("error");
        setErrorMsg(
          "Erro inesperado ao carregar o catálogo B2B. Tente novamente em instantes."
        );
      }
    }

    load();
  }, []);

  // Conta itens no carrinho
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem("b2b_cart_v1");
      if (!raw) {
        setCartCount(0);
        return;
      }
      const parsed = JSON.parse(raw) as CartItem[];
      const total = (parsed || []).reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
      setCartCount(total);
    } catch (err) {
      console.warn("Erro ao carregar carrinho B2B:", err);
      setCartCount(0);
    }
  }, []);

  function addToCart(product: Product) {
    try {
      if (typeof window === "undefined") return;

      const key = "b2b_cart_v1";
      const raw = window.localStorage.getItem(key);
      let cart: CartItem[] = [];

      if (raw) {
        try {
          cart = JSON.parse(raw) as CartItem[];
          if (!Array.isArray(cart)) cart = [];
        } catch {
          cart = [];
        }
      }

      const productId = String(product.id);
      const existing = cart.find((c) => c.productId === productId);

      if (existing) {
        existing.quantity = (existing.quantity || 0) + 1;
      } else {
        cart.push({
          productId,
          name: product.name || "Produto",
          sku: product.sku ?? undefined,
          quantity: 1,
        });
      }

      window.localStorage.setItem(key, JSON.stringify(cart));

      const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(total);
    } catch (err) {
      console.error("Erro ao adicionar item ao carrinho B2B:", err);
      setErrorMsg(
        "Não foi possível adicionar o produto ao carrinho. Tente novamente."
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Portal B2B · Pedido de cotação
            </div>
            <h1 className="text-lg font-semibold">
              Catálogo de produtos (sem preços)
            </h1>
            <p className="text-[11px] text-slate-400 max-w-xl">
              Selecione os produtos desejados, monte seu carrinho e avance para
              o pedido de cotação. Os preços serão definidos e aprovados pela
              distribuidora antes da confirmação.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <Link
              href="/b2b/checkout"
              className="inline-flex items-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-[11px] font-semibold text-black px-4 py-1.5 transition"
            >
              Ir para o carrinho / checkout
            </Link>
            <span className="text-[10px] text-slate-400">
              Itens no carrinho:{" "}
              <span className="font-semibold text-slate-100">
                {cartCount}
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {errorMsg && (
          <div className="rounded-md border border-rose-500/70 bg-rose-900/40 text-rose-50 px-3 py-2 text-[11px]">
            {errorMsg}
          </div>
        )}

        {loadState === "loading" && (
          <div className="text-[11px] text-slate-400">
            Carregando catálogo de produtos B2B...
          </div>
        )}

        {loadState === "idle" && products.length === 0 && !errorMsg && (
          <div className="text-[11px] text-slate-400">
            Nenhum produto disponível no catálogo B2B no momento.
          </div>
        )}

        {products.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden"
              >
                {/* Área da imagem – altura menor, imagem contida */}
                <div className="w-full h-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="max-h-28 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      Sem imagem
                    </span>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 flex flex-col px-3 py-3 gap-1 text-[11px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-[12px] text-slate-50 leading-snug line-clamp-2">
                      {product.name}
                    </div>
                    {product.is_offer && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/40 whitespace-nowrap">
                        Em oferta
                      </span>
                    )}
                  </div>

                  {product.category_name && (
                    <div className="text-[10px] text-slate-400">
                      {product.category_name}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400">
                    SKU:{" "}
                    <span className="font-mono text-slate-200">
                      {product.sku || "N/D"}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-1">
                    Produto disponível apenas para cotação. Nenhum preço é
                    exibido neste catálogo.
                  </p>

                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="w-full inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-[11px] font-semibold text-black px-3 py-1.5 transition"
                    >
                      Adicionar ao carrinho
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
