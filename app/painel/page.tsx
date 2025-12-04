"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const PainelLoginPage: React.FC = () => {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!email || !senha) {
      setErro("Informe e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        console.error("[LOGIN DISTRIBUIDORA] Erro:", error.message);
        setErro("Credenciais inválidas. Verifique e tente novamente.");
        return;
      }

      // login OK → vai para o painel da distribuidora
      router.push("/painel-distribuidora");
    } catch (err: any) {
      console.error("[LOGIN DISTRIBUIDORA] Erro inesperado:", err?.message || err);
      setErro("Erro inesperado ao entrar. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-slate-200 p-6">
        <div className="mb-4 text-xs font-semibold tracking-[0.25em] text-emerald-600 text-center">
          PAINEL DA DISTRIBUIDORA
        </div>
        <h1 className="text-xl font-bold text-center text-slate-900">
          Entrar no painel
        </h1>
        <p className="mt-2 text-xs text-center text-slate-600">
          Use o e-mail e a senha cadastrados para sua distribuidora. Em caso de
          dúvida, entre em contato com o suporte da plataforma.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              E-mail da distribuidora
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="email@distribuidora.com.br"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Senha
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Digite sua senha"
            />
          </div>

          {erro && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-600 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-center text-slate-500">
          Esqueceu a senha? Peça ao administrador da plataforma para redefinir
          no painel de autenticação do Supabase.
        </p>
      </div>
    </div>
  );
};

export default PainelLoginPage;
