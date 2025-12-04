import Link from "next/link";

type ModuleCardProps = {
  title: string;
  description: string;
  href: string;
};

function ModuleCard({ title, description, href }: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-emerald-500/60 hover:bg-slate-900/70 transition flex flex-col justify-between"
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-50 group-hover:text-emerald-300">
          {title}
        </h3>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <span className="mt-3 text-[11px] text-emerald-400 group-hover:text-emerald-300">
        Acessar módulo →
      </span>
    </Link>
  );
}

export default function DashboardHomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Painel interno
          </p>
          <h1 className="text-2xl font-semibold text-slate-50">
            Operação da distribuidora
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Acompanhe o dia a dia da distribuidora: produtos, catálogo online,
            clientes, pedidos, equipe, rotas, financeiro e muito mais.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-300">
            Módulos da plataforma
          </h2>
          <p className="text-[11px] text-slate-500">
            Clique em qualquer módulo para entrar direto na área interna equivalente ao dia a dia da distribuidora.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Catálogo – atalho em evidência */}
            <ModuleCard
              title="Catálogo de produtos"
              description="Visualize o catálogo online exatamente como os clientes e representantes enxergam, com carrinho e ofertas em destaque."
              href="/catalogo"
            />

            <ModuleCard
              title="Produtos"
              description="Cadastro de produtos, códigos internos, categorias e vínculo com imagens do catálogo."
              href="/dashboard/products"
            />

            <ModuleCard
              title="Imagens dos produtos"
              description="Painel dedicado para envio, troca e pré-visualização de imagens principais e ofertas."
              href="/dashboard/product-media"
            />

            <ModuleCard
              title="Clientes"
              description="Cadastro e gestão de clientes ativos, bloqueados, limites de crédito e contatos."
              href="/dashboard/customers"
            />

            <ModuleCard
              title="Pedidos"
              description="Acompanhamento dos pedidos recebidos via catálogo ou representantes."
              href="/dashboard/orders"
            />

            <ModuleCard
              title="Equipe / Representantes"
              description="Cadastro da equipe comercial, representantes e acessos ao catálogo."
              href="/dashboard/team"
            />

            <ModuleCard
              title="Estoque / Inventário"
              description="Controle de disponibilidade para expedição e visão geral de estoque."
              href="/dashboard/inventory"
            />

            <ModuleCard
              title="Relatórios"
              description="Indicadores e relatórios gerais da operação da distribuidora."
              href="/dashboard/reports"
            />

            <ModuleCard
              title="Ajuda e orientações"
              description="Documentação, orientações de uso do sistema e boas práticas."
              href="/dashboard/help"
            />

            <ModuleCard
              title="Configurações do catálogo"
              description="Visualize como o catálogo está configurado (com ou sem preços, modo orçamento etc.)."
              href="/dashboard/catalogo-config"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
