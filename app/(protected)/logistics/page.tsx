const runs = [
  {
    name: "Rota Zona Sul — Segunda",
    date: "21/11/2025",
    vehicle: "Caminhão 3/4 — Placa ABC-1234",
    orders: 8,
    status: "Em rota"
  },
  {
    name: "Rota Zona Norte — Quinta",
    date: "22/11/2025",
    vehicle: "VAN — Placa XYZ-9988",
    orders: 5,
    status: "Planejada"
  }
];

export default function LogisticsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Logística</h1>
        <p className="text-xs text-slate-400">
          Viagens de entrega da distribuidora, com foco em rota, veículo e número de
          pedidos.
        </p>
      </header>

      <section className="bg-slate-900/70 border border-slate-700 rounded-xl overflow-hidden text-xs">
        <div className="px-3 py-2 bg-slate-800/80 text-slate-300 font-medium">
          Viagens de entrega (exemplo)
        </div>
        <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-slate-800/50 text-[11px] font-medium text-slate-300 border-t border-slate-800">
          <span>Nome</span>
          <span>Data</span>
          <span>Veículo</span>
          <span className="text-center">Pedidos</span>
          <span className="text-center">Status</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {runs.map((r) => (
            <div
              key={r.name}
              className="grid grid-cols-5 gap-2 px-3 py-2 border-t border-slate-800 items-center"
            >
              <span className="text-slate-100">{r.name}</span>
              <span className="text-slate-300">{r.date}</span>
              <span className="text-slate-300">{r.vehicle}</span>
              <span className="text-center text-slate-100">{r.orders}</span>
              <span className="text-center text-emerald-300">{r.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

