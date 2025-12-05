import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import React from "react";

type InventoryProduct = {
  name: string | null;
  sku: string | null;
  category: string | null;
  unit: string | null;
};

type InventoryMovementRow = {
  id: string;
  product_id: string;
  movement_date: string | null;
  movement_type: string | null;
  origin: string | null;
  quantity: number | null;
  balance_after: number | null;
  products?: InventoryProduct[] | null;
};

export const revalidate = 0;

export default async function StockPage() {
  const supabase = createSupabaseServerClient();

  // Ajuste a consulta conforme seu schema real caso necessário
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

  // Normaliza os dados para tipos seguros
  const movements: InventoryMovementRow[] = (Array.isArray(data) ? data : []).map((d: any) => {
    return {
      id: String(d?.id ?? ""),
      product_id: String(d?.product_id ?? ""),
      movement_date: d?.movement_date ? String(d.movement_date) : null,
      movement_type: d?.movement_type ?? null,
      origin: d?.origin ?? null,
      quantity: typeof d?.quantity === "number" ? d.quantity : (d?.quantity != null ? Number(d.quantity) : null),
      balance_after: typeof d?.balance_after === "number" ? d.balance_after : (d?.balance_after != null ? Number(d.balance_after) : null),
      products: Array.isArray(d?.products)
        ? d.products.map((p: any) => ({
            name: p?.name ?? null,
            sku: p?.sku ?? null,
            category: p?.category ?? null,
            unit: p?.unit ?? null,
          }))
        : [],
    } as InventoryMovementRow;
  });

  // exemplo básico de agregação por produto (saldo)
  const balances = new Map<string, number>();
  for (const m of movements) {
    const pid = m.product_id || "unknown";
    const qty = m.quantity ?? 0;
    const prev = balances.get(pid) ?? 0;
    balances.set(pid, prev + qty);
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">Estoque — movimentos recentes</h1>
      </header>

      <section>
        <p className="text-sm text-slate-300">Movimentos carregados: <strong>{movements.length}</strong></p>

        <div className="mt-4 space-y-2">
          {movements.slice(0, 50).map((m) => {
            const prod = Array.isArray(m.products) && m.products.length > 0 ? m.products[0] : null;
            return (
              <div key={m.id} className="bg-slate-800 p-3 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{prod?.name ?? prod?.sku ?? m.product_id}</div>
                    <div className="text-xs text-slate-400">{prod?.category ?? "—"} {prod?.unit ? `• ${prod.unit}` : ""}</div>
                    <div className="text-xs text-slate-400">Origem: {m.origin ?? "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-200">{m.quantity ?? 0}</div>
                    <div className="text-xs text-slate-400">Saldo: {m.balance_after ?? "—"}</div>
                    <div className="text-xs text-slate-400">{m.movement_type ?? ""}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium text-slate-100">Saldos por produto (amostra)</h2>
        <ul className="mt-2 text-sm text-slate-300">
          {Array.from(balances.entries()).slice(0, 40).map(([pid, bal]) => (
            <li key={pid}>{pid} — {bal}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}