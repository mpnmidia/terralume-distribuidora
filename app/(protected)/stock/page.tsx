// app/(protected)/stock/page.tsx
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type InventoryMovementRow = {
  id: string;
  product_id: string;
  movement_date: string;
  movement_type: string;
  origin: string | null;
  quantity: number;
  balance_after: number | null;
  products?: {
    name: string | null;
    sku: string | null;
    category: string | null;
    unit: string | null;
  } | null;
};

type ProductBalance = {
  product_id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  quantity: number;
  last_movement_date: string | null;
};

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export const revalidate = 0;

export default async function StockPage() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("inventory_movements")
    .select(
      `
      id,
      product_id,
      movement_date,
      movement_type,
      origin,
      quantity,
      balance_after,
      products:product_id (
        name,
        sku,
        category,
        unit
      )
    `
    )
    .order("movement_date", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Erro ao carregar movimentos de estoque:", error);
  }

  const movements = (data ?? []) as InventoryMovementRow[];

  // Montar saldos por produto somando as quantidades
  const balancesMap = new Map<string, ProductBalance>();

  for (const mov of movements) {
    const pid = mov.product_id;
    const prod = mov.products ?? {};
    const current = balancesMap.get(pid);

    const baseInfo: ProductBalance = current ?? {
      product_id: pid,
      name: (prod.name ?? "Produto sem nome") as string,
      sku: (prod.sku ?? "—") as string,
      category: (prod.category ?? "—") as string,
      unit: (prod.unit ?? "UN") as string,
      quantity: 0,
      last_movement_date: mov.movement_date
    };

    baseInfo.quantity += mov.quantity ?? 0;

    // Último movimento (considerando que estamos ordenando desc)
    if (!baseInfo.last_movement_date) {
      baseInfo.last_movement_date = mov.movement_date;
    }

    balancesMap.set(pid, baseInfo);
  }

  const balances = Array.from(balancesMap.values()).sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  const totalItems = balances.reduce((acc, p) => acc + p.quantity, 0);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Estoque / Kardex
          </h1>
          <p className="text-xs text-slate-400">
            Movimentos e saldos de produtos fictícios da Doce &amp; Massa.
          </p>
        </div>
        {/* Futuro: botão para nova entrada/ajuste */}
        <button className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition">
          + Movimento de estoque (em breve)
        </button>
      </header>

      {/* Resumo */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <CardSimple
          title="Produtos com saldo"
          value={balances.length.toString()}
          description="Itens com qualquer quantidade em estoque"
        />
        <CardSimple
          title="Quantidade total"
          value={totalItems.toFixed(2)}
          description="Soma das quantidades de todos os produtos"
        />
        <CardSimple
          title="Movimentos registrados"
          value={movements.length.toString()}
          description="Entradas, saídas e ajustes"
        />
      </section>

      {/* Saldos por produto */}
      <section className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Saldos por produto
          </h2>
          <span className="text-[11px] text-slate-500">
            Fonte: movimentos em{" "}
            <span className="text-slate-300">inventory_movements</span>
          </span>
        </div>

        {balances.length === 0 ? (
          <div className="text-[11px] text-slate-400">
            Nenhum movimento de estoque encontrado para esta empresa.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-2 pr-3 font-normal">Produto</th>
                  <th className="text-left py-2 pr-3 font-normal">SKU</th>
                  <th className="text-left py-2 pr-3 font-normal">Categoria</th>
                  <th className="text-left py-2 pr-3 font-normal">Último mov.</th>
                  <th className="text-right py-2 pl-3 font-normal">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((p) => (
                  <tr
                    key={p.product_id}
                    className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40"
                  >
                    <td className="py-2 pr-3 text-slate-100">{p.name}</td>
                    <td className="py-2 pr-3 text-slate-300">{p.sku}</td>
                    <td className="py-2 pr-3 text-slate-300">{p.category}</td>
                    <td className="py-2 pr-3 text-slate-300">
                      {formatDateTime(p.last_movement_date)}
                    </td>
                    <td className="py-2 pl-3 text-right text-slate-100">
                      {p.quantity.toFixed(2)} {p.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Últimos movimentos (Kardex) */}
      <section className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Últimos movimentos
          </h2>
          <span className="text-[11px] text-slate-500">
            Mostrando até 50 mais recentes
          </span>
        </div>

        {movements.length === 0 ? (
          <div className="text-[11px] text-slate-400">
            Ainda não há movimentações registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-2 pr-3 font-normal">Data/Hora</th>
                  <th className="text-left py-2 pr-3 font-normal">Produto</th>
                  <th className="text-left py-2 pr-3 font-normal">Tipo</th>
                  <th className="text-left py-2 pr-3 font-normal">Origem</th>
                  <th className="text-right py-2 pl-3 font-normal">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {movements.slice(0, 50).map((m) => {
                  const prodName = m.products?.name ?? "—";
                  const typeLabel =
                    m.movement_type === "in"
                      ? "Entrada"
                      : m.movement_type === "out"
                      ? "Saída"
                      : "Ajuste";

                  const qtyClass =
                    m.quantity >= 0
                      ? "text-emerald-300"
                      : "text-rose-300";

                  return (
                    <tr
                      key={m.id}
                      className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40"
                    >
                      <td className="py-2 pr-3 text-slate-200">
                        {formatDateTime(m.movement_date)}
                      </td>
                      <td className="py-2 pr-3 text-slate-100">{prodName}</td>
                      <td className="py-2 pr-3 text-slate-300">
                        {typeLabel}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {m.origin ?? "—"}
                      </td>
                      <td className={"py-2 pl-3 text-right " + qtyClass}>
                        {m.quantity.toFixed(2)}
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

function CardSimple({
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

