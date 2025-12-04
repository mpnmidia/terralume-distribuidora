const showPricesEnv =
  process.env.NEXT_PUBLIC_CATALOG_SHOW_PRICES === "true";

export const revalidate = 0;

export default function CatalogoConfigPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Configurações
          </p>
          <h1 className="text-2xl font-semibold text-slate-50">
            Configurações do catálogo de produtos
          </h1>
          <p className="text-sm text-slate-400">
            Aqui você visualiza como o catálogo público está configurado
            (com preços, sem preços, modo orçamento etc.). A configuração
            atual é feita via variáveis de ambiente no servidor.
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-100">
                Exibição de preços no catálogo
              </p>
              <p className="text-xs text-slate-400">
                Define se o catálogo mostra ou esconde os valores dos produtos
                para clientes e representantes.
              </p>
            </div>
            <div
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                showPricesEnv
                  ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                  : "border-slate-600 bg-slate-900 text-slate-300",
              ].join(" ")}
            >
              <span
                className={[
                  "h-3 w-3 rounded-full border",
                  showPricesEnv
                    ? "border-emerald-300 bg-emerald-400"
                    : "border-slate-500 bg-slate-800",
                ].join(" ")}
              />
              {showPricesEnv ? "Preços visíveis" : "Sem preços (modo orçamento)"}
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-2">
            <p>
              Esta configuração é controlada pela variável:
            </p>
            <pre className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-[11px] text-slate-200 overflow-auto">
{`NEXT_PUBLIC_CATALOG_SHOW_PRICES=true  # catálogo mostra preços
NEXT_PUBLIC_CATALOG_SHOW_PRICES=false # catálogo sem preços (apenas itens e quantidades)`}
            </pre>
            <p>
              Para alterar o comportamento, ajuste o arquivo <code>.env.local</code>
              {" "}no servidor, salve e reinicie a aplicação. Em seguida,
              retorne a esta tela para confirmar a configuração.
            </p>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
          <h2 className="text-sm font-semibold text-slate-100">
            Como as distribuidoras costumam usar o catálogo
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <span className="font-semibold">Catálogo com preços:</span>{" "}
              ideal quando a distribuidora quer dar autonomia total para que
              o cliente veja valores e já tenha uma noção exata do investimento.
            </li>
            <li>
              <span className="font-semibold">Catálogo sem preços:</span>{" "}
              muito usado quando há tabelas diferenciadas por região, volume
              ou negociação com representante. O catálogo serve para montar
              o pedido (itens e quantidades), e o preço é aplicado depois.
            </li>
            <li>
              <span className="font-semibold">Modo orçamento:</span>{" "}
              o cliente monta o carrinho, envia para a distribuidora, e
              recebe depois o retorno formal com condições comerciais.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
