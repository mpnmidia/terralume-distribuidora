import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-12">
        {/* HERO */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Plataforma SaaS para distribuidoras – catálogo B2B moderno e painel completo.
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50">
              Sistema completo para distribuidoras com catálogo online e painel de gestão.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
              Centralize produtos, imagens, preços e pedidos em um único lugar.
              Ofereça um catálogo profissional para representantes e clientes,
              enquanto o time interno controla tudo pelo painel administrativo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
            >
              Ver catálogo de produtos (demo)
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:border-emerald-400"
            >
              Entrar no painel da distribuidora
            </Link>
          </div>

          <p className="text-[11px] text-slate-500">
            * O acesso ao painel é exclusivo para assinantes da plataforma.
          </p>
        </section>

        {/* MÓDULOS / BENEFÍCIOS */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-100">
            O que sua distribuidora ganha com a plataforma
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
              <h3 className="text-sm font-semibold text-slate-50">
                Catálogo online profissional
              </h3>
              <p className="text-xs text-slate-400">
                Catálogo rápido e responsivo, com imagens padronizadas, ofertas em destaque
                e carrinho de pedidos para clientes e representantes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
              <h3 className="text-sm font-semibold text-slate-50">
                Painel interno da distribuidora
              </h3>
              <p className="text-xs text-slate-400">
                Administre produtos, clientes, representantes, pedidos, tabela de preços
                e muito mais, em um ambiente seguro e organizado.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
              <h3 className="text-sm font-semibold text-slate-50">
                Flexibilidade de preços
              </h3>
              <p className="text-xs text-slate-400">
                A distribuidora pode optar por exibir ou não os preços no catálogo,
                permitindo trabalhar com tabela pública, acordos especiais ou apenas orçamento.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
              <h3 className="text-sm font-semibold text-slate-50">
                Preparado para crescimento
              </h3>
              <p className="text-xs text-slate-400">
                Arquitetura pronta para atender várias distribuidoras, com possibilidade
                futura de domínios personalizados e catálogo próprio por empresa.
              </p>
            </div>
          </div>
        </section>

        {/* CHAMADA FINAL */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">
            Pronto para levar o catálogo da sua distribuidora para outro nível?
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Use o catálogo demo para visualizar a experiência dos clientes, e depois acesse
            o painel para configurar produtos, imagens e condições comerciais da sua distribuidora.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
            >
              Acessar catálogo de exemplo
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:border-emerald-400"
            >
              Já sou assinante – entrar no painel
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
