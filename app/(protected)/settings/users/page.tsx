import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type CompanyUserRow = {
  id: string;
  auth_user_id: string | null;
  company_id: string;
  role: string | null;
  name: string | null;
  email: string | null;
  created_at: string | null;
};

export const revalidate = 0;

export default async function UsersPage() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("company_users")
    .select(
      "id, auth_user_id, company_id, role, name, email, created_at"
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao carregar usuários:", error);
  }

  const users = (data ?? []) as CompanyUserRow[];

  const totalUsers = users.length;
  const admins = users.filter(
    (u) => (u.role ?? "").toLowerCase() === "admin"
  ).length;
  const sellers = users.filter((u) =>
    (u.role ?? "").toLowerCase().includes("seller")
  ).length;
  const others = totalUsers - admins - sellers;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Usuários da empresa
          </h1>
          <p className="text-xs text-slate-400">
            Controle de acesso ao portal B2B e painel interno.
          </p>
        </div>
        <button className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition">
          + Convidar usuário (em breve)
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <SummaryCard
          title="Usuários cadastrados"
          value={totalUsers.toString()}
          description="Total de usuários vinculados à empresa"
        />
        <SummaryCard
          title="Administradores"
          value={admins.toString()}
          description="Usuários com papel de administração"
        />
        <SummaryCard
          title="Vendedores"
          value={sellers.toString()}
          description="Usuários com papel de vendedor"
        />
        <SummaryCard
          title="Outros perfis"
          value={others.toString()}
          description="Demais funções (financeiro, logística, etc.)"
        />
      </section>

      <section className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Lista de usuários
          </h2>
          <span className="text-[11px] text-slate-500">
            Fonte: tabela <span className="text-slate-300">company_users</span>
          </span>
        </div>

        {users.length === 0 ? (
          <div className="text-[11px] text-slate-400">
            Nenhum usuário cadastrado ainda. Use o painel de convites (em breve)
            para adicionar usuários ao sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-2 pr-3 font-normal">Nome</th>
                  <th className="text-left py-2 pr-3 font-normal">E-mail</th>
                  <th className="text-left py-2 pr-3 font-normal">Função</th>
                  <th className="text-left py-2 pr-3 font-normal">Status</th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Tipo de conta
                  </th>
                  <th className="text-left py-2 pr-3 font-normal">
                    Criado em
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleLabel = (u.role ?? "—").toLowerCase();
                  const rolePretty =
                    roleLabel === "admin"
                      ? "Administrador"
                      : roleLabel.includes("seller")
                      ? "Vendedor"
                      : u.role ?? "—";

                  const isLinkedToAuth = !!u.auth_user_id;

                  const createdLabel = u.created_at
                    ? new Date(u.created_at).toLocaleDateString("pt-BR")
                    : "—";

                  return (
                    <tr
                      key={u.id}
                      className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40"
                    >
                      <td className="py-2 pr-3 text-slate-100">
                        {u.name ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {u.email ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {rolePretty}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {isLinkedToAuth
                          ? "Conta vinculada"
                          : "Convite pendente / usuário demo"}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {isLinkedToAuth ? "Usuário real" : "Usuário demo"}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {createdLabel}
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

