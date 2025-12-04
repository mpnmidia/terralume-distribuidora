"use client";

import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">
          Módulo
        </p>
        <h1 className="text-2xl font-semibold text-slate-100">
          Produtos
        </h1>
        <p className="text-sm text-slate-400">
          Gerencie produtos, categorias, unidades e organize seu catálogo.
        </p>
      </header>

      {/* AÇÕES PRINCIPAIS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/products/import"
          className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-emerald-400/60 hover:bg-slate-900 transition"
        >
          <span className="text-lg">📤</span>
          <h2 className="text-sm font-semibold text-slate-100 mt-2">
            Importar via CSV
          </h2>
          <p className="text-xs text-slate-400">
            Envie planilha com produtos, preços e imagens.
          </p>
        </Link>

        <Link
          href="/dashboard/products/new"
          className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-emerald-400/60 hover:bg-slate-900 transition"
        >
          <span className="text-lg">➕</span>
          <h2 className="text-sm font-semibold text-slate-100 mt-2">
            Novo Produto
          </h2>
          <p className="text-xs text-slate-400">
            Cadastrar manualmente um produto individual.
          </p>
        </Link>

        <Link
          href="/dashboard/products/settings"
          className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-emerald-400/60 hover:bg-slate-900 transition"
        >
          <span className="text-lg">🗂️</span>
          <h2 className="text-sm font-semibold text-slate-100 mt-2">
            Categorias & Unidades
          </h2>
          <p className="text-xs text-slate-400">
            Organize as categorias, marcas e unidades.
          </p>
        </Link>
      </div>

      {/* Dica */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
        💡 Após importar os produtos, utilize <b>Product Media</b> para enviar as imagens.
      </div>
    </div>
  );
}
