import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type ReceivableRow = {
  id: string;
  company_id: string | null;
  customer_id: string | null;
  order_id: string | null;
  document_number: string | null;
  description: string | null;
  due_date: string | null;
  data_vencimento: string | null;
  amount: number | null;
  balance: number | null;
  status: string | null;
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

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d;
}

export default async function FinancePage() {
  const supabase = createSupabaseServerClient();

  const { data: receivablesData, error: receivablesError } = await supabase
    .from("receivables")
    .select(
      "id, company_id, customer_id, order_id, document_number, description, due_date, data_vencimento, amount, balance, status"
    )
    .limit(500);

  if (receivablesError) {
    console.error("Erro ao carregar receivíveis:", receivablesError);
  }

  const receivables = (receivablesData ?? []) as ReceivableRow[];

  const customerIds = Array.from(
    new Set(
      receivables
        .map((r) => r.customer_id)
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
      console.error("Erro ao carregar clientes (financeiro):", customersError);
    }

    (customersData ?? []).forEach((c) => {
      customersMap.set(c.id, c as CustomerRow);
    });
  }

  const today = new Date();

  let totalOpen = 0;
  let totalOverdue = 0;
  let totalUpcoming = 0;

  const enriched = receivables.map((r) => {
    const due =
      parseDate(r.due_date) ?? parseDate(r.data_vencimento) ?? null;

    const value = (r.balance ?? r.amount ?? 0) || 0;
    const status = (r.status ?? "").toLowerCase();

    const isPaid =
      status.includes("pago") ||
      status.includes("paga") ||
      status.includes("paid") ||
      status.includes("liquidado");

    const isOpen = !isPaid && value > 0;

    if (isOpen) {
      totalOpen += value;

      if (due && due.getTime() < today.getTime()) {
        totalOverdue += value;
      } else {
        totalUpcoming += value;
      }
    }

    const customer = r.customer_id
      ? customersMap.get(r.customer_id) ?? null
      : null;

    return {
      ...r,
      _due: due,
      _value: value,
      _statusLabel: isPaid ? "Pago" : "Em aberto",
      _customerName:
        customer?.trade_name ?? customer?.name ?? "—"
    };
  });

  enriched.sort((a, b) => {
    const aDue = a._due?.getTime() ?? 0;
    const bDue = b._due?.getTime() ?? 0;
    return aDue - bDue;
  });

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Financeiro · Contas a receber
          </h1>
          <p className="text-xs text-slate-400">
            Visão de títulos a receber da empresa demo Doce &amp; Massa.
          </p>
        </div>
        <button className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition">
          Exportar (em breve)
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <SummaryCard
          title="Em aberto"
          value={formatMoney(totalOpen)}
          description="Total de títulos não baixados"
        />
        <SummaryCard
          title="Vencido"
          value={formatMoney(totalOverdue)}
          description="Títulos em atraso"
        />
        <SummaryCard
          title="A vencer"
          value={formatMoney(totalUpcoming)}
          description="Títulos com vencimento futuro"
        />
      </section>

      <section className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Títulos a receber
          </h2>
          <span className="text-[11px] text-slate-500">
            Fonte: tabela <span className="text-slate-300">receivables</span> (Supabase)
          </span>
        </div>

        {enriched.length === 0 ? (
          <div className="text-[11px] text-slate-400">
            Nenhum título encontrado. Assim que houver dados em{" "}
            <span className="text-slate-300">receivables</span>, eles aparecerão aqui.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-2 pr-3 font-normal">Cliente</th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Nº título
                  </th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Vencimento
                  </th>
                  <th className="text-right py-2 pr-3 font-normal">
                    Valor
                  </th>
                  <th className="text-right py-2 pr-3 font-normal">
                    Saldo
                  </th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((r) => {
                  const dueLabel = r._due
                    ? r._due.toLocaleDateString("pt-BR")
                    : "—";

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40"
                    >
                      <td className="py-2 pr-3 text-slate-100">
                        {r._customerName}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {r.document_number ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {dueLabel}
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-100">
                        {formatMoney(r.amount ?? r._value)}
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-100">
                        {formatMoney(r.balance ?? r._value)}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {r._statusLabel}
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

