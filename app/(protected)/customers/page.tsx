import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import React from "react";

type DeliveryRoute = {
  name: string | null;
  day_of_week: string | null;
};

type CustomerRow = {
  id: string;
  name: string | null;
  trade_name: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  payment_terms: string | null;
  delivery_routes?: DeliveryRoute[] | null;
};

export const revalidate = 0;

export default async function CustomersPage() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      id,
      name,
      trade_name,
      cnpj,
      email,
      phone,
      city,
      state,
      address,
      payment_terms,
      delivery_routes:route_id (
        name,
        day_of_week
      )
    `
    )
    .order("trade_name", { ascending: true })
    .limit(200);

  if (error) {
    console.error("Erro ao carregar clientes:", error);
  }

  // Normaliza/valida cada cliente para garantir que bate com CustomerRow
  const customers: CustomerRow[] = (Array.isArray(data) ? data : []).map((d: any) => {
    return {
      id: String(d?.id ?? ""),
      name: d?.name ?? null,
      trade_name: d?.trade_name ?? null,
      cnpj: d?.cnpj ?? null,
      email: d?.email ?? null,
      phone: d?.phone ?? null,
      city: d?.city ?? null,
      state: d?.state ?? null,
      address: d?.address ?? null,
      payment_terms: d?.payment_terms ?? null,
      delivery_routes: Array.isArray(d?.delivery_routes)
        ? d.delivery_routes.map((r: any) => ({
            name: r?.name ?? null,
            day_of_week: r?.day_of_week ?? null,
          }))
        : [],
    } as CustomerRow;
  });

  const totalClients = customers.length;

  const cities = new Set(
    customers
      .map((c) => `${c.city ?? ""}|${c.state ?? ""}`)
      .filter((s) => s.trim() !== "|")
  );

  const routes = new Set(
    customers
      .flatMap((c) => c.delivery_routes ?? [])
      .map((r) => r.name ?? "")
      .filter((s) => s.trim() !== "")
  );

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Clientes</h1>
          <p className="text-xs text-slate-400">
            Carteira de clientes fictícia ligada à empresa demo Doce &amp; Massa.
          </p>
        </div>
        <button className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition">
          + Novo cliente (em breve)
        </button>
      </header>

      <section>
        <p className="text-sm text-slate-300">
          Total de clientes: <strong>{totalClients}</strong>
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 p-4 rounded">
            <h2 className="text-sm font-medium text-slate-200">Cidades ({cities.size})</h2>
            <ul className="mt-2 text-sm text-slate-300">
              {Array.from(cities).slice(0, 20).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800 p-4 rounded">
            <h2 className="text-sm font-medium text-slate-200">Rotas ({routes.size})</h2>
            <ul className="mt-2 text-sm text-slate-300">
              {Array.from(routes).slice(0, 20).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium text-slate-100">Lista rápida de clientes</h2>
        <div className="mt-3 space-y-2">
          {customers.slice(0, 30).map((c) => {
            const firstRoute = Array.isArray(c.delivery_routes) && c.delivery_routes.length > 0 ? c.delivery_routes[0] : null;
            const routeName = firstRoute?.name ?? "—";
            const routeDay = firstRoute?.day_of_week ?? "";
            return (
              <div key={c.id} className="bg-slate-800 p-3 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{c.trade_name ?? c.name ?? "—"}</div>
                    <div className="text-xs text-slate-400">{c.city ?? "—"} {c.state ? `/ ${c.state}` : ""}</div>
                  </div>
                  <div className="text-xs text-slate-300 text-right">
                    <div>{routeName}</div>
                    <div className="text-xs text-slate-400">{routeDay}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}