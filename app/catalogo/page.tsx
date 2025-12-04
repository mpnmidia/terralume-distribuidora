"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string | null;
  codigo: string | null;
  descricao: string | null;
  image_url: string | null;
  categoria: string | null;
  marca: string | null;
  offer_is_active: boolean | null;
  promo_label: string | null;
  show_in_b2b: boolean | null;
};

function BadgeOferta({ product }: { product: Product }) {
  if (!product.offer_is_active) return null;
  const label = product.promo_label || "OFERTA";
  return (
    <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 border border-amber-300">
      {label}
    </span>
  );
}

export default function CatalogoPublicoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todas");
  const [marcaFilter, setMarcaFilter] = useState<string>("todas");
  const [onlyOffers, setOnlyOffers] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch("/api/public/products");
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setErrorMsg(data.error || "Falha ao carregar catálogo.");
        } else {
          setProducts(data.products || []);
        }
      } catch (err) {
        setErrorMsg("Erro inesperado ao carregar catálogo.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoria && p.categoria.trim() !== "") {
        set.add(p.categoria.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const marcas = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.marca && p.marca.trim() !== "") {
        set.add(p.marca.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (onlyOffers && !p.offer_is_active) return false;

      if (categoriaFilter !== "todas") {
        if (!p.categoria || p.categoria.trim() !== categoriaFilter) {
          return false;
        }
      }

      if (marcaFilter !== "todas") {
        if (!p.marca || p.marca.trim() !== marcaFilter) {
          return false;
        }
      }

      if (!term) return true;

      const haystack = [
        p.name ?? "",
        p.codigo ?? "",
        p.descricao ?? "",
        p.categoria ?? "",
        p.marca ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [products, search, categoriaFilter, marcaFilter, onlyOffers]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho */}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Catálogo de produtos
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Explore os produtos da distribuidora com fotos, categorias,
            características e destaque de ofertas. Este catálogo é informativo:
            os preços são definidos diretamente com o time comercial.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a
              href="/b2b"
              className="px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            >
              Acessar portal B2B (pedido de cotação)
            </a>
            <span className="text-slate-500">
              Não exibe preços · Foco em vitrine e especificações
            </span>
          </div>
        </header>

        {/* Filtros e busca */}
        <section className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[2fr,1.2fr,1.2fr] items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                Buscar produto
              </label>
              <input
                type="text"
                placeholder="Nome, código, categoria ou marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                Categoria
              </label>
              <select
                value={categoriaFilter}
                onChange={(e) => setCategoriaFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="todas">Todas as categorias</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                Marca
              </label>
              <select
                value={marcaFilter}
                onChange={(e) => setMarcaFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="todas">Todas as marcas</option>
                {marcas.map((marca) => (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyOffers}
                onChange={(e) => setOnlyOffers(e.target.checked)}
              />
              <span>Mostrar apenas produtos em oferta</span>
            </label>
            <span className="text-[11px] text-slate-500">
              {filteredProducts.length} produto(s) encontrado(s) ·{" "}
              {products.length} cadastrado(s) ativo(s)
            </span>
          </div>
        </section>

        {/* Lista de produtos */}
        <section className="space-y-3">
          {loading && (
            <div className="text-sm text-slate-600">
              Carregando catálogo de produtos...
            </div>
          )}

          {errorMsg && (
            <div className="text-sm text-red-600">{errorMsg}</div>
          )}

          {!loading && !errorMsg && filteredProducts.length === 0 && (
            <div className="text-sm text-slate-500">
              Nenhum produto encontrado para os filtros selecionados.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelected(product)}
                className="group text-left rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
              >
                <div className="h-40 bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name ?? product.codigo ?? "Produto"}
                      className="max-h-full max-w-full object-contain group-hover:scale-[1.02] transition-transform"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      Sem imagem
                    </span>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold line-clamp-2">
                        {product.name || product.codigo || "Produto"}
                      </div>
                      {product.codigo && (
                        <div className="text-[11px] text-slate-500">
                          Código: {product.codigo}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 text-[11px] text-slate-500">
                        {product.categoria && (
                          <span>{product.categoria}</span>
                        )}
                        {product.marca && (
                          <span>· {product.marca}</span>
                        )}
                      </div>
                    </div>
                    <BadgeOferta product={product} />
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 line-clamp-2">
                    {product.descricao?.trim() ||
                      "Clique para ver mais detalhes deste produto."}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Modal de detalhes */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white max-w-2xl w-full mx-4 rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.18s_ease-out]">
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="text-sm font-semibold">
                  Detalhes do produto
                </h2>
                <p className="text-[11px] text-slate-500">
                  Visualização completa das informações cadastradas.
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Fechar ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-48 h-48 bg-slate-100 flex items-center justify-center overflow-hidden rounded-md">
                  {selected.image_url ? (
                    <img
                      src={selected.image_url}
                      alt={selected.name ?? selected.codigo ?? "Produto"}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      Sem imagem
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-base font-semibold">
                        {selected.name || selected.codigo || "Produto"}
                      </div>
                      {selected.codigo && (
                        <div className="text-[11px] text-slate-500">
                          Código: {selected.codigo}
                        </div>
                      )}
                    </div>
                    <BadgeOferta product={selected} />
                  </div>
                  {selected.categoria && (
                    <div className="text-[11px] text-slate-500">
                      Categoria: {selected.categoria}
                    </div>
                  )}
                  {selected.marca && (
                    <div className="text-[11px] text-slate-500">
                      Marca: {selected.marca}
                    </div>
                  )}
                  {selected.show_in_b2b && (
                    <div className="text-[11px] text-emerald-600 mt-1">
                      Disponível também para pedidos pelo portal B2B.
                    </div>
                  )}
                </div>
              </div>

              {/* Seções de informação */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="text-xs font-medium text-slate-700">
                  Descrição / características
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line">
                  {selected.descricao?.trim() ||
                    "Nenhuma descrição detalhada cadastrada para este produto até o momento."}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="text-xs font-medium text-slate-700">
                  Como comprar
                </div>
                <p className="text-xs text-slate-600">
                  Esta página é apenas informativa. Os preços não são exibidos
                  aqui. Para comprar, você pode solicitar uma proposta ou fazer
                  um pedido de cotação pelo portal B2B.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href="/b2b"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    Pedir proposta pelo portal B2B
                  </a>
                  <a
                    href={`mailto:comercial@seu-dominio.com?subject=Interesse%20no%20produto&body=Tenho%20interesse%20no%20produto%20c%C3%B3digo%20${encodeURIComponent(
                      selected.codigo ?? ""
                    )}%20/%20${encodeURIComponent(selected.name ?? "")}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Manifestar interesse por e-mail
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Fechar modal clicando fora */}
          <button
            onClick={() => setSelected(null)}
            className="fixed inset-0 -z-10 cursor-default"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
