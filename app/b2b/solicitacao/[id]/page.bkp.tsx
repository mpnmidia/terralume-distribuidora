"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Produto = {
  id: string;
  name: string;
  sku: string;
  image_url?: string | null;
  is_offer?: boolean;
  category_name?: string | null;
};

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

export default function B2BCatalogPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  // Carregar produtos do catálogo B2B
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Ajuste a rota se sua API pública tiver outro caminho
        const res = await fetch("/api/b2b/catalog", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Falha ao carregar catálogo B2B");
        }

        const json = await res.json();
        const items: Produto[] = json?.products || json?.items || [];

        setProdutos(items);
      } catch (error) {
        console.error(error);
        setProdutos([]);
        setToast({
          type: "error",
          message:
            "Não foi possível carregar o catálogo B2B. Tente novamente mais tarde.",
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // Carrinho simples em localStorage (b2b_cart_v1)
  function saveCartItemLocal(produto: Produto) {
    try {
      const key = "b2b_cart_v1";
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      let current: any[] = [];

      if (raw) {
        try {
          current = JSON.parse(raw);
        } catch {
          current = [];
        }
      }

      const existingIndex = current.findIndex(
        (item) => item.productId === produto.id
      );

      if (existingIndex >= 0) {
        current[existingIndex].quantity =
          (current[existingIndex].quantity || 0) + 1;
      } else {
        current.push({
          productId: produto.id,
          name: produto.name,
          sku: produto.sku,
          quantity: 1,
        });
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(current));
      }
    } catch (err) {
      console.error("Erro ao salvar carrinho local:", err);
    }
  }

  async function addToCart(produto: Produto) {
    setAddingId(produto.id);

    // 1) sempre salva localmente
    saveCartItemLocal(produto);

    // 2) tenta opcionalmente enviar para uma API (se você criar depois)
    try {
      await fetch("/api/b2b/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: produto.id,
          quantity: 1,
        }),
      }).catch((err) => {
        console.warn("Rota /api/b2b/cart/add não respondeu:", err);
      });
    } catch (err) {
      console.error("Erro ao sincronizar carrinho com o backend:", err);
    } finally {
      setAddingId(null);
      showToast(`Produto adicionado ao carrinho`, "success");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Barra superior */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Portal B2B · Pedido de cotação
            </div>
            <h1 className="text-lg font-semibold text-slate-50">
              Catálogo de produtos (sem preços)
            </h1>
            <p className="text-[11px] text-slate-400 max-w-xl">
              Selecione os produtos desejados, monte seu carrinho e avance
              para o pedido de cotação. Os preços serão definidos e aprovados
              pela distribuidora antes da confirmação.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/b2b/checkout"
              className="inline-flex items-center rounded-full border border-emerald-500/70 bg-emerald-600 text-black text-[11px] font-semibold px-3 py-1.5 hover:bg-emerald-500 hover:border-emerald-400 transition"
            >
              Ir para o carrinho →
            </Link>
          </div>
        </div>
      </header>

      {/* Toast simples */}
      {toast && (
        <div className="fixed top-3 inset-x-0 flex justify-center px-3 z-40">
          <div
            className={`max-w-md w-full rounded-full px-3 py-2 text-[11px] shadow-lg border ${
              toast.type === "success"
                ? "bg-emerald-900/80 border-emerald-500/60 text-emerald-50"
                : "bg-rose-900/80 border-rose-500/60 text-rose-50"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Skeleton de carregamento */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 h-56 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Sem produtos */}
        {!loading && produtos.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-6 text-center text-sm text-slate-400">
            Nenhum produto disponível no momento para o catálogo B2B.
          </div>
        )}

        {/* Grid de produtos */}
        {!loading && produtos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {produtos.map((p) => (
              <article
                key={p.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden flex flex-col hover:border-emerald-500/60 hover:bg-slate-900 transition"
              >
                <div className="relative w-full h-40 bg-slate-800/80 overflow-hidden">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                      Sem imagem
                    </div>
                  )}

                  {p.is_offer && (
                    <span className="absolute top-2 left-2 rounded-full bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 shadow">
                      OFERTA
                    </span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col gap-1">
                  <div className="text-xs font-semibold text-slate-100 line-clamp-2">
                    {p.name}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>SKU: {p.sku}</span>
                    {p.category_name && (
                      <span className="truncate max-w-[90px]">
                        {p.category_name}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Produto disponível apenas para cotação. Nenhum preço é
                    exibido neste catálogo.
                  </p>

                  <button
                    type="button"
                    onClick={() => addToCart(p)}
                    disabled={addingId === p.id}
                    className="mt-2 w-full inline-flex items-center justify-center rounded-full bg-emerald-600 text-black text-[11px] font-semibold py-1.5 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-300 transition"
                  >
                    {addingId === p.id ? "Adicionando..." : "Adicionar ao carrinho"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
