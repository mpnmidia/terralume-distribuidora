import { supabaseAdmin } from "@/lib/supabase-admin";

type Company = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  cnpj: string | null;
  phone: string | null;
  status: string;
  created_at: string;
};

export const revalidate = 0;

export default async function SaasCompaniesAdminPage() {
  const { data, error } = await supabaseAdmin
    .from("companies")
    .select("id, name, slug, email, cnpj, phone, status, created_at")
    .order("created_at", { ascending: false });

  const companies = (data || []) as Company[];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-400 mb-1">
              SaaS Admin · Assinantes
            </div>
            <h1 className="text-lg font-semibold">
              Empresas cadastradas na plataforma
            </h1>
            <p className="text-[11px] text-slate-400 max-w-2xl">
              Visão geral das distribuidoras que criaram conta via fluxo de
              assinatura. Use estas informações para vincular company_id ao
              catálogo B2B, pedidos e painéis.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 text-[11px] space-y-4">
        {error && (
          <div className="rounded-md border border-rose-500/70 bg-rose-900/40 text-rose-50 px-3 py-2">
            Erro ao carregar empresas: {String(error.message || error)}
          </div>
        )}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[12px] font-semibold">Distribuidoras</h2>
              <p className="text-[10px] text-slate-400">
                Total: {companies.length} empresa
                {companies.length === 1 ? "" : "s"} cadastrada
                {companies.length === 1 ? "" : "s"}.
              </p>
            </div>
          </div>

          <div className="overflow-auto rounded-md border border-slate-800 bg-slate-950/60">
            <table className="w-full border-collapse text-[11px]">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-slate-300">
                    Nome
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-slate-300">
                    Slug
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-slate-300">
                    E-mail
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-slate-300">
                    CNPJ
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-slate-300">
                    Telefone
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-slate-300">
                    Status
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-slate-300">
                    Criado em
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-slate-300">
                    ID (company_id)
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-3 text-center text-slate-400"
                    >
                      Nenhuma empresa cadastrada até o momento.
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr
                      key={company.id}
                      className="border-b border-slate-900 last:border-0 hover:bg-slate-900/60"
                    >
                      <td className="px-2 py-1 text-slate-50">
                        {company.name}
                      </td>
                      <td className="px-2 py-1 font-mono text-[10px] text-emerald-300">
                        {company.slug}
                      </td>
                      <td className="px-2 py-1 text-slate-200">
                        {company.email || "-"}
                      </td>
                      <td className="px-2 py-1 text-slate-200">
                        {company.cnpj || "-"}
                      </td>
                      <td className="px-2 py-1 text-slate-200">
                        {company.phone || "-"}
                      </td>
                      <td className="px-2 py-1">
                        <span
                          className={
                            "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] " +
                            (company.status === "active"
                              ? "border-emerald-400 text-emerald-300 bg-emerald-950/40"
                              : company.status === "pending"
                              ? "border-amber-400 text-amber-300 bg-amber-950/40"
                              : "border-rose-400 text-rose-300 bg-rose-950/40")
                          }
                        >
                          {company.status || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-1 text-slate-300">
                        {new Date(company.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-2 py-1">
                        <code className="text-[10px] text-slate-300 break-all">
                          {company.id}
                        </code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[10px] text-slate-500">
            Use o <span className="font-mono">id</span> (company_id) e o{" "}
            <span className="font-mono">slug</span> acima para vincular os dados
            B2B (produtos, pedidos, cotações) a cada empresa conforme
            evoluirmos o modelo multi-tenant.
          </p>
        </section>
      </main>
    </div>
  );
}