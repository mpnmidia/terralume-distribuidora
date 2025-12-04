"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type SimpleUser = {
  email: string | null;
};

const PainelDistribuidoraPage: React.FC = () => {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        // não logado → volta para a tela de login
        router.replace("/painel");
        return;
      }
      setUser({ email: data.user.email });
      setLoading(false);
    };

    checkSession();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/painel");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm">
        Verificando acesso ao painel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.25em] text-emerald-600">
              PAINEL DA DISTRIBUIDORA
            </div>
            <h1 className="text-sm font-bold text-slate-900">
              Área administrativa
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="text-[11px] text-slate-500">
                {user.email}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          <section className="md:col-span-2 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Bem-vindo ao painel da distribuidora
            </h2>
            <p className="text-xs text-slate-600 mb-3">
              Aqui você terá acesso às funcionalidades principais do seu
              sistema B2B: catálogo, clientes, pedidos e configuração de
              mídias (imagens dos produtos).
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
              <li>
                <strong>Catálogo B2B:</strong> visualize como seus clientes enxergam os produtos.
              </li>
              <li>
                <strong>Imagens de produtos:</strong> acesse o painel de upload em{" "}
                <code className="font-mono text-[11px]">
                  /admin/imagens-produto
                </code>
                {" "}para gerenciar fotos do catálogo.
              </li>
              <li>
                Futuramente aqui podem entrar módulos de clientes, pedidos,
                relatórios etc.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-100">
              <h3 className="text-xs font-semibold text-emerald-800 mb-1">
                Acesso rápido
              </h3>
              <ul className="text-[11px] text-emerald-900 space-y-1">
                <li>
                  <a
                    href="/b2b"
                    className="underline hover:no-underline"
                  >
                    Ver catálogo B2B
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/imagens-produto"
                    className="underline hover:no-underline"
                  >
                    Upload de imagens de produtos
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-3 border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-900 mb-1">
                Ajuda rápida
              </h3>
              <p className="text-[11px] text-slate-600">
                Em caso de dúvidas sobre acesso, entre em contato com o suporte
                da plataforma informando o e-mail cadastrado para sua
                distribuidora.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PainelDistribuidoraPage;
