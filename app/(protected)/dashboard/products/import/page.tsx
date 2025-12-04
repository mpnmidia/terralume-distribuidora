"use client";

import { useState } from "react";
import Link from "next/link";

type ImportResult = {
  message?: string;
  imported?: number;
  saved?: number;
  errors?: string[];
  error?: string;
};

export default function ProductsImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    if (!file) {
      setResult({ error: "Selecione um arquivo CSV antes de enviar." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/products/import-csv", {
        method: "POST",
        body: formData,
      });

      const json = (await res.json()) as ImportResult;
      setResult(json);
    } catch (error) {
      console.error(error);
      setResult({
        error: "Erro inesperado ao enviar o arquivo. Verifique o console.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">
          Produtos
        </p>
        <h1 className="text-2xl font-semibold text-slate-100">
          Importar produtos via CSV
        </h1>
        <p className="text-sm text-slate-400">
          Envie uma planilha CSV para cadastrar ou atualizar produtos em massa.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
        {/* Formulário de upload */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-200">
              Arquivo CSV
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
              }}
              className="block w-full cursor-pointer rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-500/90 file:px-3 file:py-1 file:text-xs file:font-medium file:text-slate-950 hover:file:bg-emerald-400/90"
            />
            <p className="text-[11px] text-slate-500">
              Use separador vírgula ou ponto e vírgula. Codificação UTF-8.
            </p>
          </div>

          <button
            type="submit"
            disabled={!file || isUploading}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Importando..." : "Importar CSV"}
          </button>

          {result && (
            <div className="mt-3 space-y-2 rounded-md border border-slate-700 bg-slate-900/80 p-3 text-xs text-slate-100">
              {result.error && (
                <p className="text-red-400 font-medium">
                  {result.error}
                </p>
              )}
              {result.message && (
                <p className="text-emerald-400 font-medium">
                  {result.message}
                </p>
              )}
              {(result.imported !== undefined || result.saved !== undefined) && (
                <p className="text-[11px] text-slate-300">
                  Linhas lidas no CSV:{" "}
                  <span className="font-semibold">
                    {result.imported ?? 0}
                  </span>
                  {" · "}Produtos gravados/atualizados:{" "}
                  <span className="font-semibold">
                    {result.saved ?? 0}
                  </span>
                </p>
              )}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-1 space-y-1">
                  <p className="text-[11px] font-semibold text-amber-300">
                    Avisos:
                  </p>
                  <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-slate-300">
                    {result.errors.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Instruções do CSV */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-xs text-slate-200">
          <h2 className="text-sm font-semibold text-slate-100">
            Modelo de colunas do CSV
          </h2>
          <p className="text-[11px] text-slate-400">
            A primeira linha deve conter o cabeçalho. Estas colunas são reconhecidas:
          </p>

          <ul className="list-disc space-y-1 pl-4 text-[11px]">
            <li><code className="font-mono text-emerald-300">name</code> (obrigatório)</li>
            <li><code className="font-mono text-emerald-300">sku</code> (usado como chave para atualizar)</li>
            <li><code className="font-mono text-emerald-300">category</code></li>
            <li><code className="font-mono text-emerald-300">unit</code></li>
            <li><code className="font-mono text-emerald-300">description</code></li>
            <li><code className="font-mono text-emerald-300">unit_price</code> (12,34 ou 12.34)</li>
            <li><code className="font-mono text-emerald-300">promo_price</code></li>
            <li><code className="font-mono text-emerald-300">offer_is_active</code> (true/false, 1/0, sim/não)</li>
            <li><code className="font-mono text-emerald-300">image_url</code> (URL imagem principal)</li>
            <li><code className="font-mono text-emerald-300">offer_image_url</code> (imagem para oferta, opcional)</li>
          </ul>

          <div className="rounded-md border border-slate-700 bg-slate-950/80 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto">
            name;sku;category;unit;description;unit_price;promo_price;offer_is_active;image_url
            <br />
            Biscoito Cream Cracker 20x350g;BIS-001;Biscoitos;cx;Biscoito cream cracker 20x350g;25,90;23,90;true;https://exemplo.com/imagens/biscoito1.jpg
          </div>

          <p className="text-[11px] text-slate-400">
            Depois de importar, os produtos ficam disponíveis para o Catálogo B2B
            e demais telas que usam a tabela <code className="font-mono">products</code>.
          </p>

          <p className="text-[11px] text-slate-500">
            Para trabalhar com imagens no Storage da distribuidora, utilize o módulo{" "}
            <span className="font-semibold text-emerald-300">
              Painel de imagens dos produtos
            </span>{" "}
            para enviar e vincular as imagens ao catálogo.
          </p>

          <Link
            href="/dashboard/products"
            className="inline-flex text-[11px] text-emerald-300 hover:text-emerald-200 mt-2"
          >
            ← Voltar para o módulo de Produtos
          </Link>
        </div>
      </section>
    </div>
  );
}
