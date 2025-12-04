"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type QuoteItem = {
  productId?: string;
  name?: string;
  codigo?: string;
  quantity?: number;
};

type StatusHistoryItem = {
  status: string;
  at: string;
};

type QuoteRequestPublic = {
  id: string;
  contact_name: string;
  contact_company?: string | null;
  contact_email: string;
  contact_city?: string | null;
  contact_state?: string | null;
  contact_notes?: string | null;
  status: string;
  status_history?: StatusHistoryItem[] | null;
  items_json?: QuoteItem[] | null;
  created_at: string;
};

type LoadState = "idle" | "loading" | "error";

function statusDisplay(status: string): {
  label: string;
  className: string;
  description: string;
} {
  const normalized = status?.toLowerCase?.() ?? "";

  if (normalized === "pending") {
    return {
      label: "Pendente",
      className:
        "inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-semibold",
      description:
        "Sua solicitação foi recebida e aguarda análise da equipe comercial.",
    };
  }
  if (
    normalized === "in_review" ||
    normalized === "analise" ||
    normalized === "em_analise"
  ) {
    return {
      label: "Em análise",
      className:
        "inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-semibold",
      description:
        "Sua solicitação está sendo analisada pela distribuidora.",
    };
  }
  if (normalized === "approved" || normalized === "aprovado") {
    return {
      label: "Aprovado",
      className:
        "inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-semibold",
      description:
        "Sua solicitação foi aprovada. A equipe comercial deve entrar em contato com os detalhes da proposta.",
    };
  }
  if (normalized === "rejected" || normalized === "rejeitado") {
    return {
      label: "Rejeitado",
      className:
        "inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-semibold",
      description:
        "Sua solicitação não pôde ser atendida nas condições atuais.",
    };
  }

  return {
    label: status || "Desconhecido",
    className:
      "inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-semibold",
    description: "Status atual da solicitação.",
  };
}

function historyFromRequest(
  req: QuoteRequestPublic | null
): StatusHistoryItem[] {
  if (!req) return [];
  const raw = req.status_history;
  let arr: StatusHistoryItem[] = [];
  if (Array.isArray(raw)) {
    arr = raw
      .map((h) => ({
        status: String(h.status || ""),
        at: String(h.at || ""),
      }))
      .filter((h) => h.status && h.at);
  }
  if (!arr.length) {
    if (req.status && req.created_at) {
      arr = [
        {
          status: req.status,
          at: req.created_at,
        },
      ];
    }
  }
  return arr.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );
}

function itemsFromRequest(req: QuoteRequestPublic | null): QuoteItem[] {
  if (!req || !req.items_json) return [];
  return Array.isArray(req.items_json) ? req.items_json : [];
}

function formatDateTime(value: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR");
}

type PageProps = {
  params: { id: string };
};

export default function B2BSolicitacaoStatusPage({ params }: PageProps) {
  const { id } = params;
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<QuoteRequestPublic | null>(null);

  useEffect(() => {
    async function load() {
      setLoadState("loading");
      setErrorMsg(null);
      try {
        const res = await fetch(
          `/api/b2b/public-quote-status?id=${encodeURIComponent(id)}`
        );
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setLoadState("idle");
          setData(null);
          setErrorMsg(json.error || "Solicitação não encontrada.");
          return;
        }
        setData(json.request);
        setLoadState("idle");
      } catch (err) {
        setLoadState("error");
        setErrorMsg(
          "Erro inesperado ao carregar esta solicitação. Tente novamente mais tarde."
        );
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  const statusInfo = useMemo(
    () => statusDisplay(data?.status || ""),
    [data?.status]
  );
  const history = useMemo(() => historyFromRequest(data), [data]);
  const items = useMemo(() => itemsFromRequest(data), [data]);

  const notFound = !data && loadState === "idle";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">
              Acompanhar solicitação de cotação B2B
            </div>
            <div className="text-[11px] text-slate-400 max-w-xl">
              Consulte o status da sua solicitação de cotação enviada à
              distribuidora.
            </div>
          </div>
          <Link
            href="/b2b"
            className="text-[11px] text-emerald-400 hover:text-emerald-300"
          >
            ← Voltar para o catálogo B2B
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4 text-[11px]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold mb-0.5">
                Solicitação #{id}
              </div>
              <div className="text-[11px] text-slate-400">
                Número da sua solicitação registrada no sistema da distribuidora.
              </div>
            </div>
            {data && (
              <div className="flex flex-col items-end gap-1">
                <span className={statusInfo.className}>
                  {statusInfo.label}
                </span>
                <span className="text-[10px] text-slate-400">
                  Enviada em {formatDateTime(data.created_at)}
                </span>
              </div>
            )}
          </div>
        </section>

        {loadState === "loading" && (
          <div className="text-[11px] text-slate-400">
            Carregando informações da sua solicitação...
          </div>
        )}

        {errorMsg && (
          <div className="rounded-md border border-rose-500/70 bg-rose-900/30 text-rose-100 px-3 py-2 text-[11px]">
            {errorMsg}
          </div>
        )}

        {notFound && !errorMsg && (
          <div className="rounded-md border border-rose-500/70 bg-rose-900/30 text-rose-100 px-3 py-2 text-[11px]">
            Solicitação não encontrada.
          </div>
        )}

        {data && (
          <>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
              <div className="text-[11px] font-semibold mb-1">
                Status da solicitação
              </div>
              <div className="text-[11px] text-slate-300">
                {statusInfo.description}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Nenhum preço é exibido nesta página. Os valores e
                condições comerciais são definidos diretamente pela
                distribuidora, que entrará em contato pelos dados
                informados no momento do envio.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
              <div className="text-[11px] font-semibold mb-1">
                Dados do solicitante
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400">Empresa: </span>
                  {data.contact_company || "-"}
                </div>
                <div>
                  <span className="text-slate-400">Contato: </span>
                  {data.contact_name}
                </div>
                <div>
                  <span className="text-slate-400">E-mail: </span>
                  {data.contact_email}
                </div>
                <div>
                  <span className="text-slate-400">Cidade/UF: </span>
                  {data.contact_city || "-"}
                  {data.contact_state ? ` / ${data.contact_state}` : ""}
                </div>
              </div>

              {data.contact_notes && (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold mb-1">
                    Observações enviadas
                  </div>
                  <div className="text-[11px] text-slate-300 whitespace-pre-line">
                    {data.contact_notes}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
              <div className="flex items-center justify_between">
                <div className="text-[11px] font-semibold">
                  Itens da solicitação
                </div>
                <div className="text-[10px] text-slate-500">
                  Produtos incluídos no seu pedido de cotação.
                </div>
              </div>
              <div className="max-h-[260px] overflow-auto rounded-md border border-slate-800 bg-slate-950/60">
                {items.length === 0 ? (
                  <div className="px-3 py-2 text-[11px] text-slate-400">
                    Nenhum item registrado nesta solicitação.
                  </div>
                ) : (
                  <table className="w-full text-[11px]">
                    <thead className="bg-slate-900 border-b border-slate-800">
                      <tr>
                        <th className="px-2 py-1 text-left font-medium text-slate-300">
                          Produto
                        </th>
                        <th className="px-2 py-1 text-left font-medium text-slate-300">
                          Código
                        </th>
                        <th className="px-2 py-1 text-right font-medium text-slate-300">
                          Qtde
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr
                          key={`${item.productId || idx}-${idx}`}
                          className="border-b border-slate-900 last:border-0"
                        >
                          <td className="px-2 py-1 text-slate-200">
                            {item.name || "Produto"}
                          </td>
                          <td className="px-2 py-1 text-slate-300">
                            {item.codigo || "-"}
                          </td>
                          <td className="px-2 py-1 text-right text-slate-200">
                            {item.quantity ?? 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold">
                  Linha do tempo da solicitação
                </div>
                <div className="text-[10px] text-slate-500">
                  Registro das principais mudanças de status.
                </div>
              </div>
              <div className="space-y-1.5 max-h-[180px] overflow-auto">
                {history.length === 0 && (
                  <div className="text-[11px] text-slate-400">
                    Nenhum histórico registrado até o momento.
                  </div>
                )}
                {history.map((h, idx) => {
                  const info = statusDisplay(h.status);
                  return (
                    <div
                      key={`${h.status}-${h.at}-${idx}`}
                      className="flex items-start gap-2"
                    >
                      <div className="w-1 h-5 rounded-full bg-slate-700 mt-1" />
                      <div className="space-y-0.5">
                        <span className={info.className}>
                          {info.label}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {formatDateTime(h.at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500">
                Está com dúvidas ou deseja atualizar alguma informação?
                Entre em contato diretamente com a equipe comercial da
                distribuidora e informe o número desta solicitação.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
