import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/lib/saas-tenant";

type LayoutProps = {
  children: ReactNode;
  params: { slug: string };
};

export const dynamic = "force-dynamic";

export default async function EmpresaLayout({ children, params }: LayoutProps) {
  const company = await getCompanyBySlug(params.slug);

  if (!company) {
    return notFound();
  }

  const isTerraLume = company.slug === "terra-lume-dist";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <header className="bg-slate-950 text-slate-50 border-b border-emerald-800/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full border border-emerald-400/70 bg-emerald-500/15 flex items-center justify-center text-[10px] font-semibold tracking-wide">
              {isTerraLume ? "TL" : (company.name || "?").charAt(0)}
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-semibold">
                {company.name}
              </div>
              <div className="text-[10px] text-emerald-200/90">
                Portal da distribuidora · {company.slug}
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-3 text-[11px]">
            <Link
              href={`/empresa/${company.slug}`}
              className="text-slate-200 hover:text-emerald-300"
            >
              Página inicial
            </Link>
            <Link
              href={`/empresa/${company.slug}/catalogo`}
              className="text-slate-200 hover:text-emerald-300"
            >
              Catálogo
            </Link>
            <Link
              href={`/empresa/${company.slug}/produtos`}
              className="text-slate-200 hover:text-emerald-300"
            >
              Produtos
            </Link>
            <Link
              href={`/empresa/${company.slug}/dashboard`}
              className="text-slate-200 hover:text-emerald-300"
            >
              Painel
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/90 mt-4">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
          <span>
            © {new Date().getFullYear()} {company.name}. Todos os direitos reservados.
          </span>
          <span>
            Operado via plataforma SaaS de distribuição B2B.
          </span>
        </div>
      </footer>
    </div>
  );
}