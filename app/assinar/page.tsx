"use client";

import { useState, FormEvent } from "react";

type LoadState = "idle" | "loading";

type SignUpForm = {
  companyName: string;
  cnpj: string;
  adminName: string;
  adminEmail: string;
  phone: string;
};

const INITIAL_FORM: SignUpForm = {
  companyName: "",
  cnpj: "",
  adminName: "",
  adminEmail: "",
  phone: "",
};

export default function SaasSignUpPage() {
  const [form, setForm] = useState<SignUpForm>(INITIAL_FORM);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [slugCreated, setSlugCreated] = useState<string | null>(null);

  function updateField<K extends keyof SignUpForm>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!form.companyName.trim()) return "Informe o nome da distribuidora.";
    if (!form.adminName.trim()) return "Informe o nome do responsável.";
    if (!form.adminEmail.trim()) return "Informe o e-mail do responsável.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.adminEmail.trim())) {
      return "Informe um e-mail válido.";
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loadState === "loading") return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setSlugCreated(null);

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoadState("loading");

    try {
      const res = await fetch("/api/saas/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          cnpj: form.cnpj.trim(),
          adminName: form.adminName.trim(),
          adminEmail: form.adminEmail.trim(),
          phone: form.phone.trim(),
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        const msg =
          json?.error ||
          json?.message ||
          "Não foi possível concluir o cadastro. Tente novamente.";
        setErrorMsg(msg);
        setLoadState("idle");
        return;
      }

      setSuccessMsg(
        "Distribuidora cadastrada com sucesso! Em instantes você poderá acessar o painel."
      );
      setSlugCreated(json.slug || null);
      setLoadState("idle");
      setForm(INITIAL_FORM);
    } catch (err) {
      console.error("Erro ao criar distribuidora SaaS:", err);
      setErrorMsg(
        "Erro inesperado ao enviar seus dados. Tente novamente em alguns instantes."
      );
      setLoadState("idle");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-900/60">
        <header className="mb-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-400 mb-1">
            Plataforma SaaS · Nova distribuidora
          </div>
          <h1 className="text-xl font-semibold">Criar conta de distribuidora</h1>
          <p className="text-[11px] text-slate-400 mt-1">
            Preencha os dados abaixo para ter sua própria área de distribuição
            B2B na plataforma. Nossa equipe poderá revisar e ativar sua conta
            conforme a política comercial.
          </p>
        </header>

        {errorMsg && (
          <div className="mb-3 rounded-md border border-rose-500/70 bg-rose-900/40 text-rose-50 px-3 py-2 text-[11px]">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-3 rounded-md border border-emerald-500/70 bg-emerald-900/40 text-emerald-50 px-3 py-2 text-[11px]">
            <div>{successMsg}</div>
            {slugCreated && (
              <div className="mt-1 text-[10px] text-emerald-100">
                Endereço público sugerido:{" "}
                <span className="font-mono">
                  /empresa/{slugCreated}
                </span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-[11px]">
          <div className="space-y-1">
            <label className="block text-slate-200">
              Nome da distribuidora *
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ex.: Distribuidora Exemplo LTDA"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-200">CNPJ</label>
            <input
              type="text"
              value={form.cnpj}
              onChange={(e) => updateField("cnpj", e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-200">
                Nome do responsável *
              </label>
              <input
                type="text"
                value={form.adminName}
                onChange={(e) => updateField("adminName", e.target.value)}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-slate-200">
                E-mail do responsável *
              </label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={(e) => updateField("adminEmail", e.target.value)}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="contato@empresa.com.br"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-200">Telefone / WhatsApp</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          <button
            type="submit"
            disabled={loadState === "loading"}
            className="mt-3 w-full inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-300 text-[11px] font-semibold text-black px-4 py-1.5 transition"
          >
            {loadState === "loading"
              ? "Enviando..."
              : "Solicitar criação da conta"}
          </button>

          <p className="mt-2 text-[10px] text-slate-500">
            Ao enviar, você concorda em ser contatado pela equipe da plataforma
            para validação dos dados antes da ativação do seu painel de
            distribuidora.
          </p>
        </form>
      </div>
    </div>
  );
}