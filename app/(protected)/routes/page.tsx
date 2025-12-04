import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type RouteRow = {
  id: string;
  name: string | null;
  description: string | null;
  active: boolean | null;
};

type CustomerRow = {
  id: string;
  route_id: string | null;
  city: string | null;
};

export const revalidate = 0;

export default async function RoutesPage() {
  const supabase = createSupabaseServerClient();

  const { data: routesData, error: routesError } = await supabase
    .from("delivery_routes")
    .select("id, name, description, active")
    .order("name", { ascending: true });

  if (routesError) {
    console.error("Erro ao carregar rotas:", routesError);
  }

  const routes = (routesData ?? []) as RouteRow[];

  const { data: customersData, error: customersError } = await supabase
    .from("customers")
    .select("id, route_id, city");

  if (customersError) {
    console.error("Erro ao carregar clientes (rotas):", customersError);
  }

  const customers = (customersData ?? []) as CustomerRow[];

  const customersByRoute = new Map<string, { total: number; cities: Set<string> }>();

  customers.forEach((c) => {
    if (!c.route_id) return;
    if (!customersByRoute.has(c.route_id)) {
      customersByRoute.set(c.route_id, { total: 0, cities: new Set() });
    }
    const entry = customersByRoute.get(c.route_id)!;
    entry.total += 1;
    if (c.city) entry.cities.add(c.city);
  });

  const totalRoutes = routes.length;
  const activeRoutes = routes.filter((r) => r.active !== false).length;
  const customersWithRoute = customers.filter((c) => !!c.route_id).length;
  const customersWithoutRoute = customers.length - customersWithRoute;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Rotas de entrega
          </h1>
          <p className="text-xs text-slate-400">
            Organização logística dos clientes por rota de visita/entrega.
          </p>
        </div>
        <button className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition">
          + Nova rota (em breve)
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <SummaryCard
          title="Rotas cadastradas"
          value={totalRoutes.toString()}
          description="Total de rotas de entrega"
        />
        <SummaryCard
          title="Rotas ativas"
          value={activeRoutes.toString()}
          description="Rotas marcadas como ativas"
        />
        <SummaryCard
          title="Clientes com rota"
          value={customersWithRoute.toString()}
          description="Clientes já vinculados a alguma rota"
        />
        <SummaryCard
          title="Clientes sem rota"
          value={customersWithoutRoute.toString()}
          description="Clientes ainda não roteirizados"
        />
      </section>

      <section className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Lista de rotas
          </h2>
          <span className="text-[11px] text-slate-500">
            Fonte: tabela <span className="text-slate-300">delivery_routes</span> e{" "}
            <span className="text-slate-300">customers</span>
          </span>
        </div>

        {routes.length === 0 ? (
          <div className="text-[11px] text-slate-400">
            Nenhuma rota cadastrada. Crie rotas para organizar as visitas dos vendedores.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-2 pr-3 font-normal">Rota</th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Descrição
                  </th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Cidades atendidas
                  </th>
                  <th className="text-right py-2 pr-3 font-normal">
                    Clientes na rota
                  </th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => {
                  const info = customersByRoute.get(r.id) ?? {
                    total: 0,
                    cities: new Set<string>()
                  };

                  const status =
                    r.active === false ? "Inativa" : "Ativa";

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40"
                    >
                      <td className="py-2 pr-3 text-slate-100">
                        {r.name ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-slate-300 max-w-[260px]">
                        {r.description ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {Array.from(info.cities).join(", ") || "—"}
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-100">
                        {info.total}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {status}
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

