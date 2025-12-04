import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type OrderRow = {
  id: string;
  company_id: string;
  customer_id: string | null;
  created_at: string | null;
  status: string | null;
  total_order: number | null;
};

type CustomerRow = {
  id: string;
  name: string | null;
  trade_name: string | null;
};

export const revalidate = 0;

function formatMoney(value: number | null) {
  if (value == null || !isFinite(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export default async function OrdersPage() {
  const supabase = createSupabaseServerClient();

  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id, company_id, customer_id, created_at, status, total_order"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (ordersError) {
    console.error("Erro ao carregar pedidos:", ordersError);
  }

  const orders = (ordersData ?? []) as OrderRow[];

  const customerIds = Array.from(
    new Set(
      orders
        .map((o) => o.customer_id)
        .filter((id): id is string => !!id)
    )
  );

  let customersMap = new Map<string, CustomerRow>();

  if (customerIds.length > 0) {
    const { data: customersData, error: customersError } = await supabase
      .from("customers")
      .select("id, name, trade_name")
      .in("id", customerIds);

    if (customersError) {
      console.error("Erro ao carregar clientes (orders):", customersError);
    }

    (customersData ?? []).forEach((c) => {
      customersMap.set(c.id, c as CustomerRow);
    });
  }

  const totalOrders = orders.length;
  const totalAmount = orders.reduce(
    (acc, o) => acc + (o.total_order ?? 0),
    0
  );

  const today = new Date();
  const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const ordersThisMonth = orders.filter((o) => {
    if (!o.created_at) return false;
    const d = new Date(o.created_at);
    if (isNaN(d.getTime())) return false;
    return d >= startMonth && d <= today;
  });

  const totalAmountThisMonth = ordersThisMonth.reduce(
    (acc, o) => acc + (o.total_order ?? 0),
    0
  );

  const statusCounts = new Map<string, number>();
  orders.forEach((o) => {
    const st = (o.status ?? "sem_status").toLowerCase();
    statusCounts.set(st, (statusCounts.get(st) ?? 0) + 1);
  });

  function statusLabel(raw: string | null) {
    const s = (raw ?? "").toLowerCase();
    if (s.includes("cancel")) return "Cancelado";
    if (s.includes("fatur") || s.includes("closed")) return "Faturado";
    if (s.includes("pend") || s.includes("open")) return "Pendente";
    if (!s) return "Sem status";
    return raw ?? "Sem status";
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Pedidos / Vendas
          </h1>
          <p className="text-xs text-slate-400">
            Visão geral de pedidos emitidos para os clientes da distribuidora.
          </p>
        </div>
        <button className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition">
          + Novo pedido (em breve)
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <SummaryCard
          title="Total de pedidos"
          value={totalOrders.toString()}
          description="Quantidade de pedidos cadastrados"
        />
        <SummaryCard
          title="Valor total"
          value={formatMoney(totalAmount)}
          description="Soma de todos os pedidos"
        />
        <SummaryCard
          title="Faturamento no mês"
          value={formatMoney(totalAmountThisMonth)}
          description="Pedidos emitidos no mês atual"
        />
      </section>

      <section className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Últimos pedidos
          </h2>
          <span className="text-[11px] text-slate-500">
            Fonte: tabela <span className="text-slate-300">orders</span> e{" "}
            <span className="text-slate-300">customers</span>
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="text-[11px] text-slate-400">
            Nenhum pedido encontrado. Assim que houver pedidos na tabela{" "}
            <span className="text-slate-300">orders</span>, eles aparecerão aqui.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-2 pr-3 font-normal">Data</th>
                  <th className="text-left py-2 pr-3 font-normal">Cliente</th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Status
                  </th>
                  <th className="text-right py-2 pr-3 font-normal">
                    Valor do pedido
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const customer = o.customer_id
                    ? customersMap.get(o.customer_id) ?? null
                    : null;

                  const customerName =
                    customer?.trade_name ?? customer?.name ?? "—";

                  const createdLabel = o.created_at
                    ? new Date(o.created_at).toLocaleString("pt-BR")
                    : "—";

                  const st = statusLabel(o.status);

                  return (
                    <tr
                      key={o.id}
                      className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40"
                    >
                      <td className="py-2 pr-3 text-slate-300">
                        {createdLabel}
                      </td>
                      <td className="py-2 pr-3 text-slate-100">
                        {customerName}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {st}
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-100">
                        {formatMoney(o.total_order ?? 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs">
        <h2 className="text-sm font-semibold text-slate-100 mb-2">
          Resumo por status (simplificado)
        </h2>
        {orders.length === 0 ? (
          <div className="text-[11px] text-slate-400">
            Sem dados para agrupar por status.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Array.from(statusCounts.entries()).map(([raw, count]) => (
              <div
                key={raw}
                className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] text-slate-200"
              >
                <div className="font-semibold">
                  {statusLabel(raw)}
                </div>
                <div className="text-slate-400">{count} pedido(s)</div>
              </div>
            ))}
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

