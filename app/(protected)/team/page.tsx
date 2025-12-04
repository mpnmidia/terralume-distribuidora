const users = [
  {
    name: "Ana Paula",
    email: "ana@terralume.com.br",
    role: "Proprietária",
    active: true
  },
  {
    name: "Carlos Henrique",
    email: "carlos.vendas@terralume.com.br",
    role: "Vendas",
    active: true
  },
  {
    name: "Mariana Souza",
    email: "mariana.financeiro@terralume.com.br",
    role: "Financeiro",
    active: true
  },
  {
    name: "Pedro Lima",
    email: "pedro.estoque@terralume.com.br",
    role: "Estoque",
    active: false
  }
];

export default function TeamPage() {
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Equipe</h1>
          <p className="text-xs text-slate-400">
            Usuários internos da distribuidora, com papéis por área (demo).
          </p>
        </div>
        <button className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold">
          + Convidar usuário (fictício)
        </button>
      </header>

      <section className="bg-slate-900/70 border border-slate-700 rounded-xl overflow-hidden text-xs">
        <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-slate-800/80 text-slate-300 font-medium">
          <span>Nome</span>
          <span>E-mail</span>
          <span>Papel</span>
          <span className="text-center">Status</span>
          <span className="text-center">Ações</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {users.map((u) => (
            <div
              key={u.email}
              className="grid grid-cols-5 gap-2 px-3 py-2 border-t border-slate-800 items-center"
            >
              <span className="text-slate-100">{u.name}</span>
              <span className="text-slate-300">{u.email}</span>
              <span className="text-slate-300">{u.role}</span>
              <span className="text-center">
                <span
                  className={
                    "px-2 py-1 rounded-full text-[11px] border " +
                    (u.active
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 border-slate-600")
                  }
                >
                  {u.active ? "Ativo" : "Inativo"}
                </span>
              </span>
              <span className="flex justify-center gap-1">
                <button className="px-2 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700">
                  Editar
                </button>
                <button className="px-2 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700">
                  Simular desativar
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


