"use client";

import React, { useEffect, useMemo, useState } from "react";

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

type QuoteRequest = {
  id: string;
  company_id?: string;
  contact_name: string;
  contact_company?: string | null;
  contact_email: string;
  contact_phone?: string | null;
  contact_city?: string | null;
  contact_state?: string | null;
  contact_notes?: string | null;
  items_json?: QuoteItem[] | null;
  status: string;
  created_at: string;
  admin_internal_notes?: string | null;
  status_history?: StatusHistoryItem[] | null;
};

type LoadState = "idle" | "loading" | "error";
type StatusFilter = "all" | "pending" | "in_review" | "approved" | "rejected";

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "Todos",
  pending: "Pendentes",
  in_review: "Em análise",
  approved: "Aprovados",
  rejected: "Rejeitados",
};

function statusDisplay(status: string): { label: string; className: string } {
  const normalized = status?.toLowerCase?.() ?? "";

  if (normalized === "pending") {
    return {
      label: "Pendente",
      className:
        "inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-semibold",
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
    };
  }
  if (normalized === "approved" || normalized === "aprovado") {
    return {
      label: "Aprovado",
      className:
        "inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-semibold",
    };
  }
  if (normalized === "rejected" || normalized === "rejeitado") {
    return {
      label: "Rejeitado",
      className:
        "inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-semibold",
    };
  }

  return {
    label: status || "Desconhecido",
    className:
      "inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-semibold",
  };
}

function itemsFromRequest(req: QuoteRequest | null): QuoteItem[] {
  if (!req || !req.items_json) return [];
  return Array.isArray(req.items_json) ? req.items_json : [];
}

function historyFromRequest(req: QuoteRequest | null): StatusHistoryItem[] {
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

export default function AdminB2BPedidosPage() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [internalNotesDraft, setInternalNotesDraft] = useState<string>("");

  // Carrega pedidos ao montar
  useEffect(() => {
    async function load() {
      setLoadState("loading");
      setErrorMsg(null);
      try {
        const res = await fetch("/api/admin/b2b/quote-requests");
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setLoadState("error");
          setErrorMsg(
            data.error || "Falha ao carregar pedidos de cotação B2B."
          );
          return;
        }

        const list: QuoteRequest[] = data.requests || data.data || [];
        // Ordenar por data (mais recentes primeiro)
        list.sort((a, b) => {
          const da = new Date(a.created_at).getTime();
          const db = new Date(b.created_at).getTime();
          return db - da;
        });

        setRequests(list);
        setLoadState("idle");
        if (!selectedId && list.length > 0) {
          setSelectedId(list[0].id);
          setInternalNotesDraft(list[0].admin_internal_notes || "");
        }
      } catch (err) {
        setLoadState("error");
        setErrorMsg("Erro inesperado ao carregar pedidos B2B.");
      }
    }

    load();
  }, []);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((r) => {
      if (statusFilter !== "all") {
        const normalized = r.status?.toLowerCase?.() ?? "";
        if (normalized !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      if (!term) return true;

      const haystack = [
        r.contact_name ?? "",
        r.contact_company ?? "",
        r.contact_email ?? "",
        r.contact_phone ?? "",
        r.contact_city ?? "",
        r.contact_state ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [requests, statusFilter, search]);

  const selectedRequest = useMemo(
    () => filteredRequests.find((r) => r.id === selectedId) ?? null,
    [filteredRequests, selectedId]
  );

  useEffect(() => {
    if (selectedRequest) {
      setInternalNotesDraft(selectedRequest.admin_internal_notes || "");
    } else {
      setInternalNotesDraft("");
    }
  }, [selectedRequest?.id]);

  function formatDate(dateString: string) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleString("pt-BR");
  }

  async function changeStatus(id: string, newStatus: StatusFilter) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/b2b/quote-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(
          data.error || "Falha ao atualizar o status do pedido de cotação."
        );
        return;
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: newStatus,
                status_history: [
                  ...(r.status_history || []),
                  {
                    status: newStatus,
                    at: new Date().toISOString(),
                  },
                ],
              }
            : r
        )
      );
    } catch (err) {
      alert("Erro inesperado ao atualizar status. Tente novamente.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveInternalNotes(id: string, notes: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/b2b/quote-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, internal_notes: notes }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(
          data.error || "Falha ao salvar notas internas do pedido de cotação."
        );
        return;
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                admin_internal_notes: notes,
              }
            : r
        )
      );
    } catch (err) {
      alert("Erro inesperado ao salvar notas. Tente novamente.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-sm font-semibold">
              Admin · Pedidos de cotação B2B
            </h1>
            <p className="text-[11px] text-slate-400 max-w-xl">
              Visão geral dos pedidos gerados pelo portal B2B (sem exibição de
              preços). Use este painel para analisar, aprovar ou rejeitar
              solicitações e registrar observações internas.
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Portal: <span className="font-semibold">/b2b</span> · Tabela:
            <span className="font-semibold"> b2b_quote_requests</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1.1fr)]">
        {/* Coluna esquerda: lista de pedidos + filtros */}
        <section className="space-y-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 space-y-2 text-[11px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-slate-400 mb-1">
                  Buscar por nome, empresa ou e-mail
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ex.: João, Supermercado, contato@cliente.com"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={
                      "px-2.5 py-1 rounded-full border text-[11px] " +
                      (statusFilter === s
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-200"
                        : "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-900")
                    }
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              {filteredRequests.length} pedido(s) exibido(s) para o filtro
              atual.
            </div>
          </div>

          {loadState === "loading" && (
            <div className="text-[11px] text-slate-400">
              Carregando pedidos de cotação B2B...
            </div>
          )}

          {loadState === "error" && errorMsg && (
            <div className="text-[11px] text-rose-300">{errorMsg}</div>
          )}

          {loadState === "idle" && filteredRequests.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-[11px] text-slate-400">
              Nenhum pedido encontrado para o filtro atual.
              <br />
              <span className="text-[10px]">
                Dica: verifique se já há pedidos sendo enviados pelo portal{" "}
                <span className="font-semibold">/b2b</span> e se o status
                selecionado está correto.
              </span>
            </div>
          )}

          {loadState === "idle" && filteredRequests.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden text-[11px]">
              <div className="max-h-[420px] overflow-auto divide-y divide-slate-800">
                {filteredRequests.map((req) => {
                  const statusInfo = statusDisplay(req.status);
                  const isSelected = req.id === selectedId;
                  return (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() => setSelectedId(req.id)}
                      className={
                        "w-full text-left px-3 py-2 flex items-start gap-3 transition-colors " +
                        (isSelected
                          ? "bg-slate-800/80"
                          : "hover:bg-slate-900")
                      }
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="text-[12px] font-semibold truncate">
                              {req.contact_company || req.contact_name}
                            </div>
                            <div className="text-[11px] text-slate-300 truncate">
                              {req.contact_name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {req.contact_email}
                              {req.contact_city &&
                                ` · ${req.contact_city}${
                                  req.contact_state
                                    ? " / " + req.contact_state
                                    : ""
                                }`}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={statusInfo.className}>
                              {statusInfo.label}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(req.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Coluna direita: detalhes do pedido */}
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-[11px] space-y-3">
          {!selectedRequest && (
            <div className="text-slate-400">
              Selecione um pedido na lista para visualizar os detalhes
              completos.
            </div>
          )}

          {selectedRequest && (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold mb-0.5">
                    Detalhes do pedido
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Pedido gerado em {formatDate(selectedRequest.created_at)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={statusDisplay(selectedRequest.status).className}>
                    {statusDisplay(selectedRequest.status).label}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1">
                    <button
                      type="button"
                      disabled={updatingId === selectedRequest.id}
                      onClick={() =>
                        changeStatus(selectedRequest.id, "pending")
                      }
                      className="px-2 py-1 rounded-full border border-slate-700 text-[10px] text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                    >
                      Pendente
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === selectedRequest.id}
                      onClick={() =>
                        changeStatus(selectedRequest.id, "in_review")
                      }
                      className="px-2 py-1 rounded-full border border-blue-500/70 text-[10px] text-blue-100 hover:bg-blue-900/40 disabled:opacity-60"
                    >
                      Em análise
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === selectedRequest.id}
                      onClick={() =>
                        changeStatus(selectedRequest.id, "approved")
                      }
                      className="px-2 py-1 rounded-full border border-emerald-500/70 text-[10px] text-emerald-100 hover:bg-emerald-900/40 disabled:opacity-60"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === selectedRequest.id}
                      onClick={() =>
                        changeStatus(selectedRequest.id, "rejected")
                      }
                      className="px-2 py-1 rounded-full border border-rose-500/70 text-[10px] text-rose-100 hover:bg-rose-900/40 disabled:opacity-60"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>

              {/* Dados do contato */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div>
                  <div className="text-[11px] font-semibold mb-1">
                    Dados do contato
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-400">Empresa: </span>
                      {selectedRequest.contact_company || "-"}
                    </div>
                    <div>
                      <span className="text-slate-400">Contato: </span>
                      {selectedRequest.contact_name}
                    </div>
                    <div>
                      <span className="text-slate-400">E-mail: </span>
                      {selectedRequest.contact_email}
                    </div>
                    <div>
                      <span className="text-slate-400">Telefone: </span>
                      {selectedRequest.contact_phone || "-"}
                    </div>
                    <div>
                      <span className="text-slate-400">Cidade/UF: </span>
                      {selectedRequest.contact_city || "-"}
                      {selectedRequest.contact_state
                        ? ` / ${selectedRequest.contact_state}`
                        : ""}
                    </div>
                  </div>
                </div>

                {selectedRequest.contact_notes && (
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold mb-1">
                      Observações do cliente
                    </div>
                    <div className="text-[11px] text-slate-300 whitespace-pre-line">
                      {selectedRequest.contact_notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Itens do pedido */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold">
                    Itens do pedido
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Fonte: campo <span className="font-mono">items_json</span>
                  </div>
                </div>
                <div className="max-h-[220px] overflow-auto rounded-md border border-slate-800 bg-slate-950/60">
                  {itemsFromRequest(selectedRequest).length === 0 ? (
                    <div className="px-3 py-2 text-[11px] text-slate-400">
                      Nenhum item registrado neste pedido.
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
                        {itemsFromRequest(selectedRequest).map((item, idx) => (
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
              </div>

              {/* Linha do tempo de status */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold">
                    Linha do tempo de status
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Histórico das mudanças de status deste pedido.
                  </div>
                </div>
                <div className="space-y-1.5 max-h-[160px] overflow-auto">
                  {historyFromRequest(selectedRequest).map((ev, idx) => {
                    const info = statusDisplay(ev.status);
                    return (
                      <div
                        key={`${ev.status}-${ev.at}-${idx}`}
                        className="flex items-start gap-2"
                      >
                        <div className="w-1 h-5 rounded-full bg-slate-700 mt-1" />
                        <div className="space-y-0.5">
                          <span className={info.className}>{info.label}</span>
                          <div className="text-[10px] text-slate-400">
                            {formatDate(ev.at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {historyFromRequest(selectedRequest).length === 0 && (
                    <div className="text-[11px] text-slate-400">
                      Nenhum histórico registrado. Quando você alterar o status,
                      as mudanças aparecerão aqui.
                    </div>
                  )}
                </div>
              </div>

              {/* Notas internas do administrador */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold">
                    Notas internas do administrador
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Visível apenas para a equipe interna.
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={internalNotesDraft}
                  onChange={(e) => setInternalNotesDraft(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-[11px] resize-y"
                  placeholder="Ex.: informações adicionais sobre negociação, condições combinadas, histórico de contato, etc."
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={updatingId === selectedRequest.id}
                    onClick={() =>
                      saveInternalNotes(selectedRequest.id, internalNotesDraft)
                    }
                    className="px-3 py-1.5 rounded-md bg-slate-800 text-[11px] text-slate-100 hover:bg-slate-700 disabled:opacity-60"
                  >
                    Salvar notas internas
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
