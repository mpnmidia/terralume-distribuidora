import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type ProductRow = {
  id: string;
  name: string | null;
  description: string | null;
  cost_price: number | null;
  active: boolean | null;
  show_in_b2b: boolean | null;
  is_published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export const revalidate = 0;

function formatMoney(value: number | null) {
  if (value == null || !isFinite(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function ProductsPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, description, cost_price, active, show_in_b2b, is_published, created_at, updated_at"
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao carregar produtos:", error);
  }

  const products = (data ?? []) as ProductRow[];

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active !== false).length;
  const publishedInB2B = products.filter(
    (p) => p.active !== false && p.show_in_b2b && p.is_published
  ).length;
  const draftsForB2B = products.filter(
    (p) => p.show_in_b2b && !p.is_published
  ).length;

  const filterParamRaw = searchParams?.filter;
  const filterParam =
    typeof filterParamRaw === "string" && filterParamRaw.length > 0
      ? filterParamRaw
      : "all";

  let filteredProducts = products;

  switch (filterParam) {
    case "active":
      filteredProducts = products.filter((p) => p.active !== false);
      break;
    case "inactive":
      filteredProducts = products.filter((p) => p.active === false);
      break;
    case "b2b":
      filteredProducts = products.filter(
        (p) => p.active !== false && p.show_in_b2b && p.is_published
      );
      break;
    case "drafts":
      filteredProducts = products.filter(
        (p) => p.show_in_b2b && !p.is_published
      );
      break;
    default:
      filteredProducts = products;
  }

  const filterItems: { id: string; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "active", label: "Ativos" },
    { id: "inactive", label: "Desativados" },
    { id: "b2b", label: "Publicados no B2B" },
    { id: "drafts", label: "Rascunhos B2B" }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Produtos da distribuidora
          </h1>
          <p className="text-xs text-slate-400">
            Painel interno para organizar o catálogo e controlar o que aparece
            no portal B2B.
          </p>
        </div>
        <button className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition">
          + Novo produto (em breve)
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <SummaryCard
          title="Produtos cadastrados"
          value={totalProducts.toString()}
          description="Total na tabela de produtos"
        />
        <SummaryCard
          title="Produtos ativos"
          value={activeProducts.toString()}
          description="Marcados como ativos"
        />
        <SummaryCard
          title="Publicados no B2B"
          value={publishedInB2B.toString()}
          description="Ativos, visíveis e publicados"
        />
        <SummaryCard
          title="Rascunhos para B2B"
          value={draftsForB2B.toString()}
          description="Marcados para B2B, mas não publicados"
        />
      </section>

      {/* Filtros no topo da lista */}
      <section className="bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-[11px] flex flex-wrap gap-2 items-center">
        <span className="text-slate-400 mr-1">Filtros rápidos:</span>
        {filterItems.map((f) => {
          const isActiveFilter = f.id === filterParam;
          const href =
            f.id === "all" ? "/products" : `/products?filter=${f.id}`;

          return (
            <Link
              key={f.id}
              href={href}
              className={[
                "px-3 py-1 rounded-full border transition",
                isActiveFilter
                  ? "bg-emerald-500/10 border-emerald-400 text-emerald-200"
                  : "border-slate-700 text-slate-300 hover:bg-slate-800/70"
              ].join(" ")}
            >
              {f.label}
            </Link>
          );
        })}

        <span className="ml-auto text-[10px] text-slate-500">
          Filtro atual:{" "}
          <span className="text-slate-300">
            {
              filterItems.find((f) => f.id === filterParam)?.label ??
              "Todos"
            }
          </span>
        </span>
      </section>

      <section className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Lista de produtos
          </h2>
          <span className="text-[11px] text-slate-500">
            Fonte: tabela <span className="text-slate-300">products</span> (Supabase)
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-[11px] text-slate-400">
            Nenhum produto encontrado para o filtro selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-2 pr-3 font-normal">Produto</th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Descrição
                  </th>
                  <th className="text-right py-2 pr-3 font-normal">
                    Custo base
                  </th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Status
                  </th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Portal B2B
                  </th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Criado / Atualizado
                  </th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Ações rápidas
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isActive = p.active !== false;
                  const visibleInB2B = !!p.show_in_b2b;
                  const published = !!p.is_published;

                  const createdLabel = p.created_at
                    ? new Date(p.created_at).toLocaleDateString("pt-BR")
                    : "—";
                  const updatedLabel = p.updated_at
                    ? new Date(p.updated_at).toLocaleDateString("pt-BR")
                    : "—";

                  // Lógica para coluna Portal B2B
                  let portalLabel = "Não aparece no B2B";
                  let portalColor =
                    "bg-slate-900/80 border-slate-700 text-slate-300";

                  if (!isActive && visibleInB2B && published) {
                    portalLabel = "Publicado no B2B · produto desativado";
                    portalColor =
                      "bg-red-500/10 border-red-500/60 text-red-300";
                  } else if (!isActive && visibleInB2B && !published) {
                    portalLabel = "Rascunho B2B · produto desativado";
                    portalColor =
                      "bg-red-500/10 border-red-500/60 text-red-300";
                  } else if (!isActive && !visibleInB2B) {
                    portalLabel = "Produto desativado (fora do B2B)";
                    portalColor =
                      "bg-red-500/10 border-red-500/60 text-red-300";
                  } else if (visibleInB2B && !published) {
                    portalLabel = "Rascunho B2B (aguardando publicar)";
                    portalColor =
                      "bg-amber-500/10 border-amber-500/60 text-amber-200";
                  } else if (visibleInB2B && published && isActive) {
                    portalLabel = "Publicado no B2B";
                    portalColor =
                      "bg-emerald-500/10 border-emerald-500/60 text-emerald-200";
                  }

                  const statusLabel = isActive ? "Ativo" : "Desativado";

                  const statusColor = isActive
                    ? "bg-emerald-500/10 border-emerald-500/60 text-emerald-200"
                    : "bg-red-500/10 border-red-500/60 text-red-300";

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40"
                    >
                      <td className="py-2 pr-3 text-slate-100">
                        {p.name ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-slate-300 max-w-[260px]">
                        {p.description ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-100">
                        {formatMoney(p.cost_price)}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] ${portalColor}`}
                        >
                          {portalLabel}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-slate-400">
                        <div>Criado: {createdLabel}</div>
                        <div>Atualizado: {updatedLabel}</div>
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        <div className="flex flex-col gap-1">
                          {/* Ativar / desativar */}
                          <form action="/api/products/update-flags" method="post">
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="field" value="active" />
                            <input
                              type="hidden"
                              name="value"
                              value={isActive ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-slate-600 px-2 py-0.5 text-[10px] hover:bg-slate-800"
                            >
                              {isActive ? "Desativar" : "Ativar"}
                            </button>
                          </form>

                          {/* Mostrar / ocultar no B2B */}
                          <form action="/api/products/update-flags" method="post">
                            <input type="hidden" name="id" value={p.id} />
                            <input
                              type="hidden"
                              name="field"
                              value="show_in_b2b"
                            />
                            <input
                              type="hidden"
                              name="value"
                              value={visibleInB2B ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-slate-600 px-2 py-0.5 text-[10px] hover:bg-slate-800"
                            >
                              {visibleInB2B
                                ? "Ocultar do B2B"
                                : "Mostrar no B2B"}
                            </button>
                          </form>

                          {/* Publicar / rascunho */}
                          <form action="/api/products/update-flags" method="post">
                            <input type="hidden" name="id" value={p.id} />
                            <input
                              type="hidden"
                              name="field"
                              value="is_published"
                            />
                            <input
                              type="hidden"
                              name="value"
                              value={published ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-emerald-600 px-2 py-0.5 text-[10px] hover:bg-emerald-600/20"
                            >
                              {published
                                ? "Marcar como rascunho"
                                : "Publicar no B2B"}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
      <div className="text-[11px] text-slate-400">{title}</div>
      <div className="text-lg font-semibold text-slate-50">{value}</div>
      <div className="text-[11px] text-slate-500 mt-1">{description}</div>
    </div>
  );
}

