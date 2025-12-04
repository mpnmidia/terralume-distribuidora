"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LoadState = "idle" | "loading";

type LoginForm = {
  email: string;
  password: string;
};

const INITIAL_FORM: LoginForm = {
  email: "",
  password: "",
};

const LOGIN_ENDPOINT = "/api/auth/login"; // ajuste aqui se sua rota de login for outra

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>(INITIAL_FORM);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function updateField<K extends keyof LoginForm>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!form.email.trim()) return "Informe o e-mail de acesso.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      return "Informe um e-mail válido.";
    }
    if (!form.password.trim()) return "Informe a senha de acesso.";
    if (form.password.length < 4) {
      return "A senha deve ter pelo menos 4 caracteres.";
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loadState === "loading") return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoadState("loading");

    try {
      const res = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        // Ignora se resposta não for JSON
      }

      if (!res.ok || json?.ok === false) {
        const msg =
          json?.error ||
          json?.message ||
          "Não foi possível fazer login. Verifique seus dados e tente novamente.";
        setErrorMsg(msg);
        setLoadState("idle");
        return;
      }

      setSuccessMsg("Login realizado com sucesso! Redirecionando...");
      setLoadState("idle");

      // Redireciona para o portal B2B ou área do cliente
      setTimeout(() => {
        router.push("/b2b");
      }, 800);
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setErrorMsg(
        "Erro inesperado ao tentar entrar. Tente novamente em alguns instantes."
      );
      setLoadState("idle");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-900/50">
        <header className="mb-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-400 mb-1">
            Portal B2B · Acesso do cliente
          </div>
          <h1 className="text-xl font-semibold">Entrar no portal</h1>
          <p className="text-[11px] text-slate-400 mt-1">
            Informe seu e-mail e senha cadastrados pela distribuidora para
            acessar o painel de pedidos, cotações e condições comerciais.
          </p>
        </header>

        {errorMsg && (
          <div className="mb-3 rounded-md border border-rose-500/70 bg-rose-900/40 text-rose-50 px-3 py-2 text-[11px]">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-3 rounded-md border border-emerald-500/70 bg-emerald-900/40 text-emerald-50 px-3 py-2 text-[11px]">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-[11px]">
          <div className="space-y-1">
            <label className="block text-slate-200">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="seu-email@empresa.com.br"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-200">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between mt-1">
            <Link
              href="#"
              className="text-[10px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
            >
              Esqueci minha senha
            </Link>
            <Link
              href="/b2b"
              className="text-[10px] text-emerald-400 hover:text-emerald-300"
            >
              ← Voltar ao catálogo B2B
            </Link>
          </div>

          <button
            type="submit"
            disabled={loadState === "loading"}
            className="mt-3 w-full inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-300 text-[11px] font-semibold text-black px-4 py-1.5 transition"
          >
            {loadState === "loading" ? "Entrando..." : "Entrar no portal"}
          </button>
        </form>

        <div className="mt-4 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
          Ainda não tem acesso? Entre em contato com a equipe comercial da
          distribuidora para solicitar seu cadastro no portal B2B.
        </div>
      </div>
    </div>
  );
}