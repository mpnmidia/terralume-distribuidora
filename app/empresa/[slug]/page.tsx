import Link from "next/link";
import { getCompanyBySlug } from "@/lib/saas-tenant";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

type PageProps = {
  params: { slug: string };
};

export const revalidate = 0;

export default async function EmpresaHomePage({ params }: PageProps) {
  const { slug } = params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return notFound();
  }

  const { data: productsData } = await supabaseAdmin
    .from("products")
    .select("id, name, sku, category, image_url, is_active")
    .eq("company_id", company.id)
    .eq("is_active", true)
    .limit(8);

  const produtos =
    (productsData || []) as {
      id: string;
      name: string | null;
      sku: string | null;
      category: string | null;
      image_url: string | null;
      is_active: boolean | null;
    }[];

  return (
    <div className="space-y-8 text-[11px]">
      {/* HERO COMERCIAL */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600 px-6 py-8 text-white shadow-lg">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)] items-center">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-200">
              Portal da distribuidora · {company.slug}
            </p>
            <h1 className="text-[22px] md:text-[26px] font-semibold leading-tight">
              {company.name} · Distribuidora focada em abastecer o varejo com
              eficiência e melhores ofertas.
            </h1>
            <p className="text-[11px] text-emerald-100">
              Cadastre-se, acesse o catálogo completo e envie solicitações de
              compra direto pelo portal B2B. Condições especiais para lojistas,
              minimercados, empórios e comércio em geral.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href={`/empresa/${company.slug}/catalogo`}
                className="rounded-full bg-emerald-300 px-4 py-1.5 text-[11px] font-semibold text-emerald-950 hover:bg-emerald-200"
              >
                Abrir catálogo agora
              </Link>
              <Link
                href="/b2b/checkout"
                className="rounded-full border border-emerald-200/80 bg-white/5 px-4 py-1.5 text-[11px] font-medium text-emerald-50 hover:bg-white/10"
              >
                Acompanhar minhas solicitações
              </Link>
            </div>

            <ul className="pt-2 space-y-1 text-[10px] text-emerald-100">
              <li>• Catálogo organizado por categorias de produto.</li>
              <li>• Solicitação de cotação em poucos cliques.</li>
              <li>• Operação pensada para o dia a dia do pequeno e médio varejo.</li>
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-2xl bg-emerald-950/20 border border-emerald-300/40 px-4 py-3 shadow-lg shadow-emerald-950/40">
              <p className="text-[10px] font-semibold text-emerald-100 mb-2">
                Destaques do momento
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded-xl bg-emerald-950/40 px-2 py-2">
                  <p className="text-emerald-50 font-medium line-clamp-2">
                    Condições especiais para novos lojistas cadastrados
                  </p>
                  <p className="mt-1 text-emerald-200 text-[9px]">
                    Descontos progressivos conforme volume de compra.
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-950/40 px-2 py-2">
                  <p className="text-emerald-50 font-medium line-clamp-2">
                    Linha completa de alimentos para mercearias e empórios
                  </p>
                  <p className="mt-1 text-emerald-200 text-[9px]">
                    Itens com giro rápido e foco em margem para o varejo.
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[9px] text-emerald-200">
                Este portal foi construído para facilitar o relacionamento B2B
                entre a distribuidora e os clientes lojistas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO POR QUE COMPRAR */}
      <section className="max-w-5xl mx-auto grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold text-slate-900 mb-1">
            Foco no varejo
          </p>
          <p className="text-[10px] text-slate-600">
            Política comercial pensada para quem vive de revenda. Mix, preço e
            condições ajustadas para o dia a dia da loja.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold text-slate-900 mb-1">
            Catálogo sempre atualizado
          </p>
          <p className="text-[10px] text-slate-600">
            Produtos gerenciados diretamente pela distribuidora, com status de
            ativo, imagem e descrição para facilitar a escolha.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold text-slate-900 mb-1">
            Solicitação online
          </p>
          <p className="text-[10px] text-slate-600">
            Seu pedido começa aqui no portal B2B e segue para o time comercial
            finalizar condições e logística.
          </p>
        </div>
      </section>

      {/* VITRINE DE PRODUTOS ATIVOS */}
      <section className="max-w-5xl mx-auto space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[12px] font-semibold text-slate-900">
            Destaques do catálogo
          </h2>
          <Link
            href={`/empresa/${company.slug}/catalogo`}
            className="text-[10px] font-medium text-emerald-700 hover:underline"
          >
            Ver catálogo completo
          </Link>
        </div>

        {produtos.length === 0 ? (
          <p className="text-[10px] text-slate-500">
            Os produtos desta distribuidora ainda estão sendo cadastrados no
            portal.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {produtos.map((p) => (
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
                      Imagem indisponível
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
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA FINAL */}
      <section className="max-w-5xl mx-auto rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/80 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold text-emerald-900">
            Pronto para abastecer sua loja com {company.name}?
          </p>
          <p className="text-[10px] text-emerald-800">
            Acesse o catálogo completo, escolha os itens e envie sua solicitação.
          </p>
        </div>
        <Link
          href={`/empresa/${company.slug}/catalogo`}
          className="rounded-full bg-emerald-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500"
        >
          Ver catálogo da distribuidora
        </Link>
      </section>
    </div>
  );
}