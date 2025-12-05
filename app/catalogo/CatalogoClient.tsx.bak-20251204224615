"use client";

import { useMemo, useState } from "react";
import type { ProductRow } from "./page";

type Product = ProductRow;

type CartItem = {
  product: Product;
  quantity: number;
};

type Props = {
  initialProducts: Product[];
  showPrices: boolean;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export default function CatalogoClient({ initialProducts, showPrices }: Props) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return initialProducts;
    return initialProducts.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) ||
        (p.sku ?? "").toLowerCase().includes(term)
      );
    });
  }, [initialProducts, search]);

  function getProductDisplayPrice(product: Product): number | null {
    if (!showPrices) return null;
    const promo = (product as any).promo_price ?? null;
    const unit = (product as any).unit_price ?? null;
    const price = promo ?? unit;
    if (typeof price === "number") return price;
    return null;
  }

  const cartTotals = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const item of cart) {
      count += item.quantity;
      const price = getProductDisplayPrice(item.product);
      if (price !== null) {
        total += price * item.quantity;
      }
    }
    return { count, total };
  }, [cart, showPrices]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setFeedback(null);
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }

  function clearCart() {
    setCart([]);
    setFeedback(null);
  }

  async function handleSendOrder() {
    if (cart.length === 0) {
      setFeedback("Adicione pelo menos 1 produto ao carrinho antes de enviar.");
      return;
    }

    setSending(true);
    setFeedback(null);

    try {
      // Aqui ainda é modo DEMO: em produção você pode
      // chamar uma rota /api para gravar o pedido no Supabase
      // ou enviar por e-mail / WhatsApp corporativo.
      console.log("Pedido (DEMO) enviado:", {
        items: cart,
        note,
        showPrices,
      });

      setFeedback(
        "Pedido montado com sucesso. Em modo demo, os dados aparecem apenas na console do servidor. Em produção, integre esta ação ao módulo de pedidos."
      );
      setCart([]);
      setNote("");
    } catch (err) {
      console.error(err);
      setFeedback("Erro ao enviar pedido. Tente novamente em instantes.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      {/* LISTA DE PRODUTOS */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col min-h-[480px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Produtos do catálogo
            </h2>
            <p className="text-[11px] text-slate-500">
              Clique em &quot;Adicionar&quot; para enviar itens para o carrinho.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 w-48 sm:w-64"
            />
          </div>
        </div>

        {!showPrices && (
          <div className="mb-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
            Este catálogo está configurado sem exibir preços. Clientes e representantes
            montam o carrinho normalmente e a distribuidora aplica a tabela de preços
            na aprovação do pedido.
          </div>
        )}

        <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          {filteredProducts.length === 0 ? (
            <p className="text-xs text-slate-500">
              Nenhum produto encontrado. Ajuste a busca ou tente novamente.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredProducts.map((product) => {
                const price = getProductDisplayPrice(product);
                const hasOffer =
                  product.offer_is_active && (product.offer_image_url || (product as any).promo_price);

                return (
                  <article
                    key={product.id}
                    className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs"
                  >
                    <div className="h-16 w-16 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {product.image_url || product.offer_image_url ? (
                        <img
                          src={product.offer_image_url || product.image_url || ""}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-500 px-1 text-center">
                          sem imagem
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-[13px] font-semibold text-slate-100">
                            {product.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 text-[11px] text-slate-500">
                            {product.sku && <span>Cód: {product.sku}</span>}
                            {hasOffer && (
                              <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-1.5 py-0.5 text-amber-300 text-[10px]">
                                oferta
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {showPrices ? (
                        <div className="flex items-baseline gap-2">
                          {price !== null ? (
                            <>
                              <span className="text-[13px] font-semibold text-emerald-400">
                                {formatCurrency(price)}
                              </span>
                              {(product as any).unit_price &&
                                (product as any).promo_price &&
                                (product as any).promo_price <
                                  (product as any).unit_price && (
                                  <span className="text-[11px] text-slate-500 line-through">
                                    {formatCurrency((product as any).unit_price)}
                                  </span>
                                )}
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              Preço não definido
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Preço: a definir pela distribuidora.
                        </p>
                      )}

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="rounded-lg bg-emerald-500 px-3 py-1 text-[11px] font-medium text-slate-950 hover:bg-emerald-400"
                        >
                          Adicionar ao carrinho
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CARRINHO */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col min-h-[320px]">
        <header className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Carrinho
            </h2>
            <p className="text-[11px] text-slate-500">
              Revise os itens e envie o pedido para a distribuidora.
            </p>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-[11px] text-slate-400 hover:text-red-300"
            >
              Limpar carrinho
            </button>
          )}
        </header>

        <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          {cart.length === 0 ? (
            <p className="text-xs text-slate-500">
              Nenhum item no carrinho. Selecione produtos no catálogo ao lado.
            </p>
          ) : (
            <ul className="space-y-3 text-xs">
              {cart.map((item) => {
                const price = getProductDisplayPrice(item.product);
                const lineTotal =
                  price !== null ? price * item.quantity : null;

                return (
                  <li
                    key={item.product.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-100 truncate">
                        {item.product.name}
                      </p>
                      {item.product.sku && (
                        <p className="text-[11px] text-slate-500">
                          Cód: {item.product.sku}
                        </p>
                      )}
                      {showPrices && price !== null ? (
                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatCurrency(price)}{" "}
                          <span className="text-slate-500">unidade</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-slate-500">
                          Preço será aplicado pela distribuidora.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          className="px-2 text-xs text-slate-300 hover:text-emerald-400"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.product.id,
                              Number(e.target.value) || 1
                            )
                          }
                          className="w-10 bg-transparent text-center text-xs text-slate-100 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          className="px-2 text-xs text-slate-300 hover:text-emerald-400"
                        >
                          +
                        </button>
                      </div>
                      {showPrices && lineTotal !== null && (
                        <p className="text-[11px] font-semibold text-emerald-400">
                          {formatCurrency(lineTotal)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* RESUMO / OBS / ENVIAR */}
        <div className="mt-3 space-y-2 text-xs">
          {cart.length > 0 && (
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>
                Itens:{" "}
                <strong className="text-slate-50">
                  {cartTotals.count}
                </strong>
              </span>
              {showPrices && cartTotals.total > 0 && (
                <span>
                  Total estimado:{" "}
                  <strong className="text-emerald-400">
                    {formatCurrency(cartTotals.total)}
                  </strong>
                </span>
              )}
            </div>
          )}

          <label className="block text-[11px] text-slate-300">
            Observações para a distribuidora
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Ex.: forma de pagamento combinada, prazo, referência da visita do representante..."
            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
          />

          {feedback && (
            <p className="text-[11px] text-amber-300">
              {feedback}
            </p>
          )}

          <button
            type="button"
            disabled={sending || cart.length === 0}
            onClick={handleSendOrder}
            className="mt-1 w-full rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? "Enviando pedido..." : "Enviar pedido para a distribuidora"}
          </button>

          <p className="text-[10px] text-slate-500">
            Este fluxo está em modo de demonstração. Em produção, conecte o envio
            do carrinho ao módulo de pedidos (Supabase / ERP / e-mail corporativo).
          </p>
        </div>
      </section>
    </div>
  );
}
