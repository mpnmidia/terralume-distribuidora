"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Pedidos", href: "/orders", icon: "🧾" },
  { label: "Clientes", href: "/customers", icon: "👥" },
  { label: "Produtos", href: "/products", icon: "📦" },
  { label: "Tabelas de Preço", href: "/price-lists", icon: "💲" },
  { label: "Estoque", href: "/stock", icon: "📊" },
  { label: "Financeiro", href: "/finance", icon: "💰" },
  { label: "Logística", href: "/logistics", icon: "🚚" },
  { label: "Rotas", href: "/routes", icon: "🗺️" },
  { label: "Equipe", href: "/team", icon: "🧑‍💼" },
];

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-60 flex-col border-r border-slate-800 bg-slate-950/90">
        {/* Logo / nome da empresa */}
        <div className="px-4 py-4 border-b border-slate-800 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300">
            TL
          </div>
          <div className="leading-tight">
            <div className="text-[11px] text-slate-400 uppercase">
              Ambiente Terra Lume
            </div>
            <div className="text-sm font-semibold text-slate-100">
              Distribuidora Terra Lume
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (pathname && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-2 rounded-lg px-3 py-2 transition border",
                  active
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-200"
                    : "bg-transparent border-transparent text-slate-300 hover:bg-slate-900/80 hover:border-slate-700 hover:text-slate-100",
                ].join(" ")}
              >
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da sidebar */}
        <div className="px-4 py-3 border-t border-slate-800 text-[11px] text-slate-500">
          <div>Distribuidora Terra Lume </div>
          <div className="text-slate-600">
            Arrumar o slogam aqui.
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        {/* Header superior */}
        <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between px-4 md:px-6">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 uppercase">
              Painel interno
            </span>
            <span className="text-sm font-medium text-slate-100">
              Operação da distribuidora
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-[11px] leading-tight">
              <span className="text-slate-300">Usuário demo</span>
              <span className="text-slate-500">admin@terralume.com.br</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-semibold text-slate-200 border border-slate-700">
              AD
            </div>
          </div>
        </header>

        {/* Área onde entram as páginas (dashboard, pedidos, etc.) */}
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}


