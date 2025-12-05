import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/lib/saas-tenant";
import { supabaseAdmin } from "@/lib/supabase-admin";

type PageProps = {
  params: { slug: string };
};

export const revalidate = 0;

export default async function EmpresaDashboardPage({ params }: PageProps) {
  const { slug } = params;
  const company = await getCompanyBySlug(slug);
  if (!company) return notFound();

  const { data: productsData } = await supabaseAdmin
    .from("products")
    .select("id, is_active")
    .eq("company_id", company.id);

  const totalProdutos = productsData?.length || 0;
  const ativos = (productsData || []).filter((p) => p.is_active !== false)
    .length;
  const inativos = totalProdutos - ativos;

  const { count: totalSolicitacoes } = await supabaseAdmin
    .from("b2b_quote_requests")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id);

  return (
    <div className="space-y-5 text-[11px]">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
            Painel da distribuidora
          </p>
          <h1 className="text-[15px] font-semibold text-slate-900">
            Resumo da operação B2B · {company.name}
          </h1>
          <p className="text-[10px] text-slate-500">
            Acompanhe produtos cadastrados, status do catálogo e solicitações
            recebidas pelo portal.
          </p>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50 p-3">
          <p className="text-[9px] font-semibold text-emerald-700 uppercase tracking-[0.14em]">
            Catálogo
          </p>
          <p className="mt-1 text-[18px] font-semibold text-emerald-900">
            {totalProdutos}
          </p>
          <p className="text-[10px] text-emerald-900/80">
            produtos cadastrados no catálogo interno.
          </p>
          <p className="mt-1 text-[9px] text-emerald-800/80">
            Ativos: {ativos} · Inativos: {inativos}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-[0.14em]">
            Solicitações B2B
          </p>
          <p className="mt-1 text-[18px] font-semibold text-slate-900">
            {totalSolicitacoes ?? 0}
          </p>
          <p className="text-[10px] text-slate-600">
            solicitações de orçamento / pedido feitas via portal.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-[0.14em]">
            Alertas rápidos
          </p>
          <ul className="mt-1 space-y-1 text-[10px] text-slate-600">
            <li>
              • Verifique produtos sem imagem para fortalecer o catálogo.
            </li>
            <li>
              • Priorize ativar itens de maior giro para lojistas.
            </li>
            <li>• Use o módulo de importação para carga em massa.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}