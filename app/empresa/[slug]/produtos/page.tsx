import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/lib/saas-tenant";
import { supabaseAdmin } from "@/lib/supabase-admin";

type PageProps = {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

type ProductRow = {
  id: string;
  name: string | null;
  sku: string | null;
  category: string | null;
  description?: string | null;
  image_url?: string | null;
  unit?: string | null;
  barcode?: string | null;
  is_active?: boolean | null;
  created_at: string;
};

export const revalidate = 0;

export default async function EmpresaProdutosPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = params;
  const company = await getCompanyBySlug(slug);
  if (!company) return notFound();

  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      "id, name, sku, category, description, image_url, unit, barcode, is_active, created_at"
    )
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const produtos = (data || []) as ProductRow[];

  const success = searchParams?.success === "1";
  const msgRaw = searchParams?.msg;
  const successMsg =
    typeof msgRaw === "string" && msgRaw.length > 0
      ? decodeURIComponent(msgRaw)
      : "Operação concluída com sucesso.";

  return (
    <div className="space-y-4 text-[11px]">
      {error && (
        <div className="rounded-md border border-rose-500/70 bg-rose-50 text-rose-900 px-3 py-2">
          Erro ao carregar produtos: {String(error.message || error)}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-emerald-500/80 bg-emerald-50 text-emerald-900 px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
              ✓
            </span>
            <span>{successMsg}</span>
          </div>
          <span className="text-[9px] text-emerald-800/80">
            Log interno: operação finalizada sem erros.
          </span>
        </div>
      )}

      <section className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[13px] font-semibold text-slate-900">
            Catálogo interno de produtos
          </h1>
          <p className="text-[10px] text-slate-500">
            Empresa:{" "}
            <span className="font-medium text-slate-800">
              {company.name}
            </span>{" "}
            · Total: {produtos.length} produto
            {produtos.length === 1 ? "" : "s"} cadastrado
            {produtos.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/empresa/${company.slug}/produtos/importar`}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[10px] text-slate-800 hover:bg-slate-50"
          >
            Importar / arrastar produtos
          </Link>
          <Link
            href={`/empresa/${company.slug}/produtos/novo`}
            className="rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-500"
          >
            + Novo produto
          </Link>
        </div>
      </section>

      {/* Tabela padrão */}
      <section className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold text-slate-900">
            Visão em tabela
          </h2>
          <span className="text-[9px] text-slate-500">
            Ideal para conferência rápida, exportação e auditoria.
          </span>
        </div>
        <div className="overflow-auto rounded-md border border-slate-200 bg-slate-50">
          <table className="w-full border-collapse text-[11px]">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-2 py-1 text-left font-medium text-slate-700">
                  SKU
                </th>
                <th className="px-2 py-1 text-left font-medium text-slate-700">
                  Produto
                </th>
                <th className="px-2 py-1 text-left font-medium text-slate-700">
                  Categoria
                </th>
                <th className="px-2 py-1 text-left font-medium text-slate-700">
                  Unidade
                </th>
                <th className="px-2 py-1 text-left font-medium text-slate-700">
                  Código barras
                </th>
                <th className="px-2 py-1 text-left font-medium text-slate-700">
                  Ativo
                </th>
                <th className="px-2 py-1 text-left font-medium text-slate-700">
                  Criado em
                </th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-3 text-center text-slate-500"
                  >
                    Nenhum produto cadastrado ainda para esta distribuidora.
                  </td>
                </tr>
              ) : (
                produtos.map((p) => {
                  const ativo =
                    typeof p.is_active === "boolean" ? p.is_active : true;

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-slate-200 last:border-0 hover:bg-slate-100/70"
                    >
                      <td className="px-2 py-1 font-mono text-[10px] text-slate-800">
                        {p.sku || "—"}
                      </td>
                      <td className="px-2 py-1 text-slate-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {p.name || "Sem nome"}
                          </span>
                          {p.description && (
                            <span className="text-[10px] text-slate-500 line-clamp-1">
                              {p.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1 text-slate-800">
                        {p.category || "—"}
                      </td>
                      <td className="px-2 py-1 text-slate-800">
                        {p.unit || "—"}
                      </td>
                      <td className="px-2 py-1 text-slate-800">
                        {p.barcode || "—"}
                      </td>
                      <td className="px-2 py-1">
                        <span
                          className={
                            "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] " +
                            (ativo
                              ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                              : "border-slate-400 text-slate-700 bg-slate-50")
                          }
                        >
                          {ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-2 py-1 text-slate-800 whitespace-nowrap">
                        {new Date(p.created_at).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Visão em cartões / galeria */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold text-slate-900">
            Visão em cartões (galeria do catálogo interno)
          </h2>
          <span className="text-[9px] text-slate-500">
            Ideal para revisar imagens, nomes e categorias visualmente.
          </span>
        </div>

        {produtos.length === 0 ? (
          <p className="text-[10px] text-slate-500">
            Assim que houver produtos cadastrados, eles aparecerão aqui em
            formato de cartões.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {produtos.map((p) => {
              const ativo =
                typeof p.is_active === "boolean" ? p.is_active : true;

              return (
                <div
                  key={p.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:border-emerald-500/70 hover:shadow-md transition"
                >
                  <div className="mb-2 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_url}
                        alt={p.name || "Produto"}
                        className="max-h-20 max-w-full object-contain group-hover:scale-[1.03] transition"
                      />
                    ) : (
                      <span className="text-[9px] text-slate-400">
                        Sem imagem
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-900 line-clamp-2">
                    {p.name || "Produto sem nome"}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    {p.category || "Categoria não informada"}
                  </p>
                  <p className="text-[9px] font-mono text-slate-500 mt-1">
                    SKU: {p.sku || "automático"}
                  </p>
                  <p className="mt-1 text-[9px] text-slate-500">
                    Unidade: {p.unit || "—"}
                  </p>
                  <p className="mt-0.5 text-[9px] text-slate-500">
                    Código de barras: {p.barcode || "—"}
                  </p>
                  <div className="mt-1">
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] " +
                        (ativo
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-400/70"
                          : "bg-slate-50 text-slate-700 border border-slate-300")
                      }
                    >
                      {ativo ? "Ativo no catálogo" : "Inativo"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}