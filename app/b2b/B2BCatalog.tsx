"use client";

import { useMemo, useState } from "react";

type CatalogItem = {
  id: string;
  name: string;
  description: string;
  cost_price: number | null;
  quantity_balance: number;
  imageUrl: string;
};

type Props = {
  items: CatalogItem[];
};

type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

function formatMoney(value: number | null | undefined) {
  if (value == null || !isFinite(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export default function B2BCatalog({ items }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const selectedProduct = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId]
  );

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return items
      .filter((i) => i.id !== selectedProduct.id)
      .slice(0, 6);
  }, [items, selectedProduct]);

  const cartSummary = useMemo(() => {
    const totalItems = cart.reduce((acc, c) => acc + c.quantity, 0);
    const totalValue = cart.reduce(
      (acc, c) => acc + c.quantity * c.unitPrice,
      0
    );
    return { totalItems, totalValue };
  }, [cart]);

  function handleAddToCart(product: CatalogItem) {
    const unitPrice = (product.cost_price ?? 0) * 1.35 || 10; // mark-up demo
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        return prev.map((c) =>
          c.productId === product.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice
        }
      ];
    });
  }

  function handleChangeQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.productId === productId
            ? { ...c, quantity: Math.max(1, c.quantity + delta) }
            : c
        )
        .filter((c) => c.quantity > 0)
    );
  }

  function handleRemoveFromCart(productId: string) {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* BARRA DO CARRINHO */}
        <section className="flex items-center justify-between gap-2 text-[11px] mb-1">
          <div className="text-slate-400">
            Portal B2B · Catálogo em tempo real a partir do estoque.
          </div>
          <button
            type="button"
            onClick={() => setCartOpen((v) => !v)}
            className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-200 hover:bg-emerald-500/20 transition flex items-center gap-2"
          >
            <span>
              Carrinho ({cartSummary.totalItems} item
              {cartSummary.totalItems === 1 ? "" : "s"})
            </span>
            <span className="font-semibold">
              {formatMoney(cartSummary.totalValue)}
            </span>
          </button>
        </section>

        {/* GRID DE PRODUTOS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Catálogo de produtos
              </h2>
              <p className="text-[11px] text-slate-400">
                Clique em um produto para ver detalhes, fotos e adicionar ao
                carrinho.
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-[11px] text-slate-400 border border-dashed border-slate-700 rounded-xl p-4">
              Nenhum produto com saldo em estoque encontrado. Assim que houver
              movimentos na tabela de estoque, o catálogo será preenchido
              automaticamente aqui.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((p) => {
                const unitPrice = (p.cost_price ?? 0) * 1.35 || 10;
                return (
                  <article
                    key={p.id}
                    className="group rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-colors flex flex-col overflow-hidden cursor-pointer"
                    onClick={() => setSelectedId(p.id)}
                  >
                    <div className="h-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
                      />
                    </div>
                    <div className="flex-1 p-3 space-y-2">
                      <h3 className="text-sm font-medium text-slate-50 line-clamp-2">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-3">
                        {p.description}
                      </p>
                      <div className="flex items-end justify-between gap-2 pt-1">
                        <div className="space-y-1">
                          <div className="text-[11px] text-slate-400">
                            Preço base (demo)
                          </div>
                          <div className="text-base font-semibold text-emerald-300">
                            {formatMoney(unitPrice)}
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-400">
                          <div>Estoque:</div>
                          <div className="text-slate-100 font-semibold">
                            {p.quantity_balance.toLocaleString("pt-BR")} un
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 bg-slate-950/80 px-3 py-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p);
                        }}
                        className="flex-1 rounded-lg bg-emerald-500/90 text-slate-950 text-[11px] font-medium py-1.5 hover:bg-emerald-400 transition"
                      >
                        Adicionar ao carrinho
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(p.id);
                        }}
                        className="rounded-lg border border-slate-700 text-[11px] text-slate-200 px-3 py-1.5 hover:bg-slate-800/70 transition"
                      >
                        Detalhes
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MODAL DE DETALHES */}
      {selectedProduct && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="max-w-4xl w-full rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100">
                Detalhes do produto
              </h3>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-[11px] text-slate-400 hover:text-slate-100"
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Imagem principal + thumbs */}
              <div className="border-b md:border-b-0 md:border-r border-slate-800 flex flex-col">
                <div className="h-64 bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="border-t border-slate-800 px-3 py-2 space-y-1">
                  <div className="text-[11px] text-slate-400 mb-1">
                    Produtos similares
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {[selectedProduct, ...relatedProducts].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedId(p.id)}
                        className={`flex-shrink-0 h-14 w-14 rounded-lg border ${
                          p.id === selectedProduct.id
                            ? "border-emerald-400"
                            : "border-slate-700"
                        } overflow-hidden`}
                      >
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Infos do produto */}
              <div className="p-4 flex flex-col gap-3 text-[12px]">
                <div>
                  <h4 className="text-sm font-semibold text-slate-50">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
                    <div className="text-slate-400">Preço base (demo)</div>
                    <div className="text-lg font-semibold text-emerald-300">
                      {formatMoney(
                        (selectedProduct.cost_price ?? 0) * 1.35 || 10
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
                    <div className="text-slate-400">Estoque disponível</div>
                    <div className="text-lg font-semibold text-slate-100">
                      {selectedProduct.quantity_balance.toLocaleString(
                        "pt-BR"
                      )}{" "}
                      un
                    </div>
                  </div>
                </div>

                <div className="mt-1 text-[11px] text-slate-500">
                  <p>
                    Aqui você pode futuramente exibir unidade de venda
                    (cx, fardo, unidade), múltiplos mínimos, regras de
                    desconto por volume, etc.
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="flex-1 rounded-lg bg-emerald-500/90 text-slate-950 text-[11px] font-semibold py-2 hover:bg-emerald-400 transition"
                  >
                    Adicionar ao carrinho
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="rounded-lg border border-slate-700 text-[11px] text-slate-200 px-3 py-2 hover:bg-slate-800/70 transition"
                  >
                    Voltar ao catálogo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAINEL DO CARRINHO */}
      {cartOpen && (
        <div className="fixed bottom-0 inset-x-0 z-30">
          <div className="mx-auto max-w-6xl px-4 pb-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur shadow-xl p-3 text-[11px]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-200 font-semibold">
                  Carrinho de compras (demo)
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="text-slate-400 hover:text-slate-100"
                >
                  Fechar
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-slate-400">
                  Nenhum item no carrinho. Clique em &quot;Adicionar ao
                  carrinho&quot; em qualquer produto do catálogo.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between gap-2 border-b border-slate-800/70 pb-1 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="text-slate-100">
                            {item.name}
                          </div>
                          <div className="text-slate-400">
                            {formatMoney(item.unitPrice)} · Qtde:{" "}
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeQuantity(item.productId, -1)
                            }
                            className="h-6 w-6 rounded-full border border-slate-700 text-slate-200 flex items-center justify-center hover:bg-slate-800"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeQuantity(item.productId, +1)
                            }
                            className="h-6 w-6 rounded-full border border-slate-700 text-slate-200 flex items-center justify-center hover:bg-slate-800"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveFromCart(item.productId)
                            }
                            className="ml-1 text-slate-500 hover:text-red-400"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="text-slate-300">
                      Total ({cartSummary.totalItems} item
                      {cartSummary.totalItems === 1 ? "" : "s"})
                    </div>
                    <div className="text-slate-100 font-semibold text-base">
                      {formatMoney(cartSummary.totalValue)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-slate-500">
                      Futuramente este botão pode criar um pedido real
                      na tabela <span className="text-slate-300">orders</span>.
                    </div>
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-500/90 text-slate-950 text-[11px] font-semibold px-4 py-1.5 hover:bg-emerald-400 transition"
                    >
                      Finalizar pedido (demo)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

