"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";

export type B2BProduct = {
  id: string;
  name: string;
  sku: string | null;
  unit_price: number | null;
  image_url: string | null;
  offer_image_url: string | null;
};

type Props = {
  initialProducts: B2BProduct[];
};

export default function B2BCatalogClient({ initialProducts }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialProducts;
    return initialProducts.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q)
      );
    });
  }, [initialProducts, query]);

  const isEmpty = initialProducts.length === 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Catálogo B2B</h1>
          <p className="text-sm text-slate-400">
            Portal para clientes e representantes consultarem o mix da distribuidora.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <input
            type="text"
            placeholder="Buscar produto ou código..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
        <p className="font-semibold mb-1">Visibilidade de preços</p>
        <p className="text-slate-400">
          Os preços exibidos aqui podem ser personalizados no futuro para trabalhar com clientes
          logados, política comercial e faixas de desconto por canal.
        </p>
      </div>

      {isEmpty && !query ? (
        <p className="text-sm text-slate-400">
          Nenhum produto cadastrado no catálogo ainda. Assim que você importar via CSV
          ou cadastrar no painel, eles aparecerão aqui automaticamente.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">
          Nenhum produto encontrado para a busca{" "}
          <span className="font-semibold">"{query}"</span>.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
