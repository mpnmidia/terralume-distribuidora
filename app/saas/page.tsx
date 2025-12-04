import Link from "next/link";

export default function SaasPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-5xl w-full py-8 space-y-8">
        <header className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300">
            Plataforma multiempresa para distribuidoras de alimentos
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold">
            Distribuidora SaaS
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto">
            Uma plataforma completa para distribuidoras de massas, doces e
            alimentos embalados. Cada empresa com seu próprio painel interno,
            site B2B, portal de pedidos e operação integrada de vendas, estoque,
            financeiro e logística.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-4 text-xs">
          <FeatureCard
            title="Painel interno completo"
            description="Pedidos, clientes, produtos, estoque, financeiro e rotas em um só lugar, com papéis de usuário e permissões por área."
          />
          <FeatureCard
            title="Site B2B para cada distribuidora"
            description="Cada assinante ganha um site próprio com sua marca, catálogo online e portal de pedidos para clientes."
          />
          <FeatureCard
            title="Multiempresa e escalável"
            description="Várias distribuidoras, cada uma com dados isolados: logomarca, cores, rotas, tabelas de preço e equipe interna."
          />
        </section>

        <section className="grid md:grid-cols-2 gap-4 text-xs">
          <FeatureCard
            title="Portal de pedidos B2B"
            description="Seus clientes fazem pedidos online, veem histórico e acompanham status de entrega. Tudo integrado ao painel interno."
          />
          <FeatureCard
            title="Operação enxuta e organizada"
            description="Alertas de estoque crítico, títulos vencidos, rotas do dia e indicadores de faturamento ajudam na tomada de decisão."
          />
        </section>

        <section className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs border border-slate-800 rounded-xl p-4 bg-slate-900/70">
          <div className="text-left space-y-1">
            <h2 className="text-sm font-semibold text-slate-100">
              Primeiro case: Terra Lume Distribuidora
            </h2>
            <p className="text-[11px] text-slate-400 max-w-md">
              A Terra Lume é a distribuidora modelo da plataforma, usando o
              sistema para controlar pedidos, clientes, estoque e rotas de
              entrega. Confira o portal demo para ver como sua distribuidora
              também pode funcionar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 font-semibold text-xs transition"
            >
              Ver demo Terra Lume
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 hover:border-emerald-400/60 hover:bg-slate-900 px-4 py-2 text-xs transition"
            >
              Acessar painel interno demo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-[11px] text-slate-400">{description}</p>
    </div>
  );
}

