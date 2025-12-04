"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

type CartItem = {
  productId: string;
  name: string;
  sku?: string;
  quantity: number;
};

type LoadState = "idle" | "loading";

type FormState = {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  company: "",
  contactName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  notes: "",
};

export default function B2BCheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);

  // Carrega carrinho do localStorage
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const keysToTry = [
        "b2b_cart_v1", // chave nova
        "b2b_cart",
        "cart_b2b",
        "cart_items",
      ];

      let items: CartItem[] = [];

      for (const key of keysToTry) {
        const raw = window.localStorage.getItem(key);
        console.log("Checando carrinho localStorage:", key, raw);

        if (!raw) continue;

        try {
          const parsed = JSON.parse(raw) as any[];
          if (parsed && parsed.length > 0) {
            items = parsed.map((item) => ({
              productId: String(item.productId ?? item.id),
              name: String(item.name ?? item.nome ?? "Produto"),
              sku: item.sku ? String(item.sku) : undefined,
              quantity: Number(item.quantity ?? item.qtd ?? 1),
            }));
            break;
          }
        } catch (err) {
          console.warn("Erro ao parsear carrinho em", key, err);
        }
      }

      setCartItems(items);
    } catch (err) {
      console.error("Erro geral ao carregar carrinho B2B:", err);
    }
  }, []);

  function updateField<K extends keyof FormState>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm(): string | null {
    if (!form.company.trim()) return "Informe o nome da empresa.";
    if (!form.contactName.trim()) return "Informe o nome do responsável / contato.";
    if (!form.email.trim()) return "Informe um e-mail para contato.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      return "Informe um e-mail válido.";
    }
    if (cartItems.length === 0) {
      return "Seu carrinho está vazio. Adicione ao menos um produto antes de enviar a cotação.";
    }
    return null;
  }

  function clearCart() {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("b2b_cart_v1");
      }
      setCartItems([]);
      setErrorMsg(null);
      setSuccessMsg(null);
    } catch (err) {
      console.error("Erro ao limpar carrinho:", err);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loadState === "loading") return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setLastRequestId(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoadState("loading");

    try {
      const body = {
        contact_company: form.company,
        contact_name: form.contactName,
        contact_email: form.email,
        contact_phone: form.phone,
        contact_city: form.city,
        contact_state: form.state,
        contact_notes: form.notes,
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/b2b/send-quote-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || "Falha ao enviar a solicitação de cotação.");
      }

      const requestId: string | undefined =
        json.requestId || json.id || json.request?.id;

      setSuccessMsg("Solicitação enviada com sucesso! Guarde o número ou clique em acompanhar.");
      setLastRequestId(requestId ?? null);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("b2b_cart_v1");
      }
      setCartItems([]);
      setForm(EMPTY_FORM);
    } catch (err: any) {
      console.error("Erro ao enviar solicitação B2B:", err);
      setErrorMsg(
        err?.message ||
          "Não foi possível enviar a solicitação de cotação. Tente novamente em instantes."
      );
    } finally {
      setLoadState("idle");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Portal B2B · Etapa 2 de 2
            </div>
            <h1 className="text-lg font-semibold">Pedido de cotação B2B</h1>
            <p className="text-[11px] text-slate-400 max-w-xl">
              Revise os itens do carrinho, preencha seus dados e envie sua
              solicitação de cotação. Nenhum preço é definido nesta etapa.
            </p>
          </div>

          <Link
            href="/b2b"
            className="text-[11px] text-emerald-400 hover:text-emerald-300"
          >
            ← Voltar ao catálogo
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Mensagens de feedback */}
        {errorMsg && (
          <div className="rounded-md border border-rose-500/70 bg-rose-900/40 text-rose-50 px-3 py-2 text-[11px]">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="rounded-md border border-emerald-500/70 bg-emerald-900/40 text-emerald-50 px-3 py-2 text-[11px]">
            {successMsg}
            {lastRequestId && (
              <div className="mt-1 text-[10px]">
                Número da solicitação:{" "}
                <span className="font-mono">{lastRequestId}</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Coluna esquerda: formulário */}
          <section className="lg:col-span-2 space-y-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4 text-[11px]"
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[12px] font-semibold">
                  Dados do solicitante
                </h2>
                <span className="text-[10px] text-slate-500">
                  Campos marcados com * são obrigatórios.
                </span>
              </div>

              {/* Empresa / Responsável */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-200">
                    Empresa / Razão social *
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-200">
                    Responsável / Contato *
                  </label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => updateField("contactName", e.target.value)}
                    className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Email / Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-200">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-200">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Cidade / UF */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="block text-[11px] text-slate-200">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-200">
                    UF
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={form.state}
                    onChange={(e) =>
                      updateField("state", e.target.value.toUpperCase())
                    }
                    className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] uppercase outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-200">
                  Observações adicionais para a distribuidora
                </label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  placeholder="Ex.: prazos desejados, marca preferencial, condições especiais..."
                />
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="submit"
                  disabled={loadState === "loading"}
                  className="inline-flex items-center rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-300 text-[11px] font-semibold text-black px-4 py-1.5 transition"
                >
                  {loadState === "loading"
                    ? "Enviando solicitação..."
                    : "Enviar solicitação de cotação"}
                </button>
              </div>
            </form>
          </section>

          {/* Coluna direita: resumo do carrinho */}
          <aside className="space-y-3">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-[11px]">
              <div className="flex items-center justify-between mb-2 gap-2">
                <div>
                  <h2 className="text-[12px] font-semibold">
                    Itens do pedido de cotação
                  </h2>
                  <span className="text-[10px] text-slate-500">
                    {cartItems.length} item(ns)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  disabled={cartItems.length === 0}
                  className="text-[10px] rounded-full border border-slate-700 px-3 py-1 hover:border-rose-400 hover:text-rose-300 disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:text-slate-400 transition"
                >
                  Limpar carrinho
                </button>
              </div>

              {cartItems.length === 0 ? (
                <p className="text-slate-400 text-[11px]">
                  Seu carrinho está vazio. Volte ao catálogo B2B para selecionar
                  produtos antes de enviar a cotação.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="rounded-md border border-slate-800 bg-slate-950/80 px-2 py-1.5 flex flex-col gap-0.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[11px] font-semibold text-slate-100 leading-tight line-clamp-2">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-200 whitespace-nowrap">
                          x{item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="truncate">
                          SKU: {item.sku || "N/D"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-[10px] text-slate-500">
                Nenhum preço é exibido ou definido nesta etapa. A distribuidora
                analisará sua solicitação e retornará com uma proposta comercial
                pelos canais informados.
              </p>

              {lastRequestId && (
                <div className="mt-3 border-t border-slate-800 pt-2 space-y-1">
                  <div className="text-[10px] text-slate-400">
                    Acompanhar status da solicitação:
                  </div>
                  <Link
                    href={`/b2b/solicitacao/${lastRequestId}`}
                    className="inline-flex items-center rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] px-3 py-1"
                  >
                    Ver status da solicitação #{lastRequestId}
                  </Link>
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
