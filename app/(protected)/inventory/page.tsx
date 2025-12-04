import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type StockRow = {
  company_id: string;
  product_id: string;
  product_name: string | null;
  product_code: string | null;
  cost_price: number | null;
  quantity_balance: number | null;
};

export const revalidate = 0;

function formatMoney(value: number | null) {
  if (value == null || !isFinite(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export default async function InventoryPage() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("stock_balances_detailed")
    .select(
      "company_id, product_id, product_name, product_code, cost_price, quantity_balance"
    )
    .limit(500);

  if (error) {
    console.error("Erro ao carregar estoque:", error);
  }

  const rows = (data ?? []) as StockRow[];

  const itemsWithStock = rows.filter(
    (r) => (r.quantity_balance ?? 0) > 0
  );

  const uniqueProducts = new Set(
    itemsWithStock.map((r) => r.product_id)
  );

  const totalSkus = uniqueProducts.size;
  const totalQty = itemsWithStock.reduce(
    (acc, r) => acc + (r.quantity_balance ?? 0),
    0
  );

  const totalValue = itemsWithStock.reduce((acc, r) => {
    const qty = r.quantity_balance ?? 0;
    const cost = r.cost_price ?? 0;
    return acc + qty * cost;
  }, 0);

  const groupedByProduct = new Map<
    string,
    {
      product_id: string;
      product_name: string | null;
      product_code: string | null;
      total_qty: number;
      cost_price: number | null;
    }
  >();

  rows.forEach((r) => {
    const key = r.product_id;
    const existing = groupedByProduct.get(key);
    const qty = r.quantity_balance ?? 0;
    if (!existing) {
      groupedByProduct.set(key, {
        product_id: r.product_id,
        product_name: r.product_name,
        product_code: r.product_code,
        total_qty: qty,
        cost_price: r.cost_price
      });
    } else {
      existing.total_qty += qty;
    }
  });

  const aggregated = Array.from(groupedByProduct.values()).sort(
    (a, b) => (b.total_qty || 0) - (a.total_qty || 0)
  );

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Estoque de produtos
          </h1>
          <p className="text-xs text-slate-400">
            Saldos de estoque consolidados por produto, a partir dos movimentos.
          </p>
        </div>
        <button className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition">
          Ajuste de estoque (em breve)
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <SummaryCard
          title="SKUs com estoque"
          value={totalSkus.toString()}
          description="Produtos com saldo maior que zero"
        />
        <SummaryCard
          title="Quantidade total"
          value={totalQty.toLocaleString("pt-BR")}
          description="Soma de unidades em estoque"
        />
        <SummaryCard
          title="Valor em estoque"
          value={formatMoney(totalValue)}
          description="Baseado no custo unitário dos produtos"
        />
      </section>

      <section className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Produtos em estoque
          </h2>
          <span className="text-[11px] text-slate-500">
            Fonte: view{" "}
            <span className="text-slate-300">stock_balances_detailed</span>
          </span>
        </div>

        {aggregated.length === 0 ? (
          <div className="text-[11px] text-slate-400">
            Nenhum saldo de estoque encontrado. Assim que houver movimentos
            em <span className="text-slate-300">inventory_movements</span>,
            os saldos aparecerão aqui.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-2 pr-3 font-normal">Código</th>
                  <th className="text-left py-2 pr-3 font-normal">Produto</th>
                  <th className="text-right py-2 pr-3 font-normal">
                    Qtde. em estoque
                  </th>
                  <th className="text-right py-2 pr-3 font-normal">
                    Custo unitário
                  </th>
                  <th className="text-right py-2 pr-3 font-normal">
                    Valor total
                  </th>
                </tr>
              </thead>
              <tbody>
                {aggregated.map((p) => {
                  const unitCost = p.cost_price ?? 0;
                  const total = (p.total_qty ?? 0) * unitCost;

                  return (
                    <tr
                      key={p.product_id}
                      className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40"
                    >
                      <td className="py-2 pr-3 text-slate-200">
                        {p.product_code ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-slate-100">
                        {p.product_name ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-100">
                        {p.total_qty.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-300">
                        {formatMoney(unitCost)}
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-100">
                        {formatMoney(total)}
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

