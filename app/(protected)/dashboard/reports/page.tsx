import Link from "next/link";

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-4">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Módulo
          </p>
          <h1 className="text-2xl font-semibold text-slate-50">
            Relatórios
          </h1>
          <p className="text-sm text-slate-400">
            Indicadores de vendas, produtos mais vendidos, clientes ativos e performance comercial.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200 space-y-3">
          <p>
            Esta página está em modo de demonstração. Aqui você pode implementar os
            componentes e fluxos específicos do módulo <strong>Relatórios</strong> de acordo
            com a necessidade da distribuidora.
          </p>
          <p className="text-xs text-slate-400">
            Dica: utilize esta rota como base para o ambiente administrativo da Terra Lume
            Distribuidora e, depois, replique o mesmo padrão para outros clientes do SaaS.
          </p>
        </section>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="text-xs text-emerald-400 hover:underline"
          >
            ← Voltar para os módulos da plataforma
          </Link>
        </div>
      </div>
    </main>
  );
}
