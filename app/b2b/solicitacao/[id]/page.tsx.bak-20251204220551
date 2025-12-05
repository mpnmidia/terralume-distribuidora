import { supabaseAdmin } from "@/lib/supabase-admin";

type PageProps = {
  params: { id: string };
};

export const revalidate = 0;

async function getQuoteRequest(rawId: string) {
  const id = decodeURIComponent(rawId).replace(/^#/, "").trim();

  const { data, error } = await supabaseAdmin
    .from("b2b_quote_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar solicitação B2B:", error);
    return { quote: null as any, error: "Erro ao buscar a solicitação no banco." };
  }

  return { quote: data as any, error: null as string | null };
}

export default async function AcompanharSolicitacaoPage({ params }: PageProps) {
  const { quote, error } = await getQuoteRequest(params.id);
  const codigoLimpo = decodeURIComponent(params.id).replace(/^#/, "").trim();

  return (
    <div className="space-y-4 text-[11px]">
      <section className="space-y-1">
        <h1 className="text-[14px] font-semibold text-slate-50">
          Acompanhar solicitação de cotação B2B
        </h1>
        <p className="text-[10px] text-slate-300">
          Consulte o status da sua solicitação de cotação enviada à distribuidora.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 space-y-1">
        <p className="text-[10px] text-slate-200">
          Solicitação{" "}
          <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">
            {codigoLimpo}
          </span>
        </p>
        <p className="text-[10px] text-slate-400">
          Número da sua solicitação registrada no sistema da distribuidora.
        </p>
      </section>

      {error && (
        <div className="rounded-md border border-rose-500/70 bg-rose-50 px-3 py-2 text-rose-900">
          Ocorreu um erro ao consultar a solicitação. Tente novamente em alguns instantes.
        </div>
      )}

      {!error && !quote && (
        <div className="rounded-md border border-rose-500/80 bg-rose-900/60 px-3 py-2 text-[11px] text-rose-50">
          <p className="font-semibold">Solicitação não encontrada.</p>
          <p className="text-[10px] text-rose-100 mt-1">
            Verifique se o código foi copiado exatamente como aparece na confirmação
            (sem espaços e sem o símbolo "#" no início) e tente novamente.
          </p>
        </div>
      )}

      {quote && (
        <section className="space-y-3 rounded-2xl border border-emerald-600/60 bg-emerald-950/50 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold text-emerald-200">
                Detalhes da solicitação
              </p>
              <p className="text-[10px] text-emerald-100">
                Solicitação registrada em:{" "}
                <span className="font-mono">
                  {quote.created_at
                    ? new Date(quote.created_at).toLocaleString("pt-BR")
                    : "Data não disponível"}
                </span>
              </p>
            </div>
            <div>
              <span className="inline-flex items-center rounded-full border border-emerald-400 bg-emerald-700/50 px-2 py-0.5 text-[9px] text-emerald-50">
                Status:{" "}
                <span className="ml-1 font-semibold">
                  {quote.status || "Em análise"}
                </span>
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-700/50 bg-slate-950/60 p-3 space-y-2">
            <p className="text-[10px] text-emerald-100">
              Empresa solicitante:{" "}
              <span className="font-medium">
                {quote.buyer_name || "Não informado"}
              </span>
            </p>
            <p className="text-[10px] text-emerald-100">
              Contato:{" "}
              <span className="font-medium">
                {quote.buyer_contact || quote.buyer_email || "Não informado"}
              </span>
            </p>

            {quote.items && (
              <div className="mt-2">
                <p className="text-[10px] font-semibold text-emerald-200 mb-1">
                  Itens da solicitação
                </p>
                <pre className="max-h-40 overflow-auto rounded-md bg-slate-950/90 p-2 text-[9px] text-emerald-100">
                  {JSON.stringify(quote.items, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <p className="text-[9px] text-emerald-200/80">
            Em caso de dúvida, entre em contato com o time comercial da distribuidora
            informando este código de solicitação.
          </p>
        </section>
      )}
    </div>
  );
}