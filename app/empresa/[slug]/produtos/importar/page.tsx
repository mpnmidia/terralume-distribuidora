"use client";

import { useState, DragEvent, ChangeEvent } from "react";
import Link from "next/link";

type PageProps = {
  params: { slug: string };
};

type ImportLogLine = {
  type: "info" | "success" | "error";
  message: string;
};

type FileCard = {
  name: string;
  status: "idle" | "processing" | "success" | "error";
  message?: string;
};

export default function ImportarProdutosPage({ params }: PageProps) {
  const { slug } = params;
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [cards, setCards] = useState<FileCard[]>([]);
  const [logs, setLogs] = useState<ImportLogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [finishedOk, setFinishedOk] = useState(false);

  function pushLog(line: ImportLogLine) {
    setLogs((prev) => [...prev, line]);
  }

  function updateCard(name: string, patch: Partial<FileCard>) {
    setCards((prev) =>
      prev.map((c) => (c.name === name ? { ...c, ...patch } : c))
    );
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  async function processFile(file: File) {
    const fileName = file.name;
    updateCard(fileName, { status: "processing", message: "Processando..." });
    pushLog({ type: "info", message: `Recebido arquivo: ${fileName}` });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", slug);

      const res = await fetch("/api/empresa/produtos/importar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error || `Falha ao processar o arquivo "${fileName}".`;
        pushLog({ type: "error", message: msg });
        updateCard(fileName, { status: "error", message: msg });
        setFinishedOk(false);
      } else {
        const lines = Array.isArray(data.logs) ? data.logs : [];
        lines.forEach((msg: string) =>
          pushLog({ type: "info", message: `[${fileName}] ${msg}` })
        );

        const doneMsg =
          data.created && data.created > 0
            ? `Importação concluída: ${data.created} produto(s) criado(s).`
            : "Importação concluída. Verifique o log.";
        pushLog({ type: "success", message: `[${fileName}] ${doneMsg}` });
        updateCard(fileName, { status: "success", message: doneMsg });
        setFinishedOk(true);
      }
    } catch (err: any) {
      console.error(err);
      const msg = `[${fileName}] Erro inesperado durante a importação.`;
      pushLog({ type: "error", message: msg });
      updateCard(fileName, { status: "error", message: msg });
      setFinishedOk(false);
    }
  }

  async function processFilesList(files: FileList) {
    if (!files || files.length === 0) return;

    setLogs([]);
    setFinishedOk(false);
    setRunning(true);

    const names: string[] = [];
    const newCards: FileCard[] = [];
    for (let i = 0; i < files.length; i++) {
      names.push(files[i].name);
      newCards.push({
        name: files[i].name,
        status: "idle",
        message: "Aguardando processamento",
      });
    }
    setFileNames(names);
    setCards(newCards);

    pushLog({
      type: "info",
      message: `Iniciando importação de ${files.length} arquivo(s)...`,
    });

    for (let i = 0; i < files.length; i++) {
      await processFile(files[i]);
    }

    pushLog({
      type: "success",
      message: "Processamento de todos os arquivos finalizado.",
    });

    setRunning(false);
  }

  async function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFilesList(e.dataTransfer.files);
    }
  }

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      await processFilesList(e.target.files);
    }
  }

  return (
    <div className="space-y-4 text-[11px]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-[14px] font-semibold text-slate-900">
            Importar produtos (arrastar, planilha, imagens)
          </h1>
          <p className="text-[10px] text-slate-500">
            Este módulo é o ponto de entrada para carga em massa de produtos da
            distribuidora. Você pode integrar aqui a lógica de leitura de
            planilha e classificação por imagem que já existe no projeto.
          </p>
        </div>
        <Link
          href={`/empresa/${slug}/produtos`}
          className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-[10px] text-slate-800 hover:bg-slate-50"
        >
          Voltar para lista
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="rounded-2xl border border-dashed border-emerald-400 bg-emerald-50 px-6 py-10 text-center"
          >
            <p className="text-[11px] font-semibold text-emerald-900 mb-1">
              Arraste sua planilha ou imagens de produtos para cá
            </p>
            <p className="text-[10px] text-emerald-900/80 mb-2">
              Formatos comuns: CSV, XLSX, imagens de embalagens, etc. A leitura
              detalhada e classificação ficam a cargo do módulo inteligente que
              você conectar nesta tela.
            </p>
            {fileNames.length > 0 ? (
              <p className="text-[10px] text-emerald-900">
                {fileNames.length} arquivo(s) selecionado(s).
              </p>
            ) : (
              <p className="text-[10px] text-emerald-700">
                Solte um ou mais arquivos aqui ou utilize o botão abaixo.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-[10px] text-slate-700">
              <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-medium text-slate-50 cursor-pointer">
                Selecionar arquivo(s)
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={onFileChange}
                  disabled={running}
                />
              </span>
              <span>
                Escolha um ou vários arquivos manualmente caso não queira
                arrastar.
              </span>
            </label>
            {running && (
              <span className="text-[10px] text-emerald-700 font-medium">
                Processando importação...
              </span>
            )}
          </div>

          {/* CARDS POR ARQUIVO */}
          {cards.length > 0 && (
            <div className="grid gap-2 md:grid-cols-2">
              {cards.map((card) => (
                <div
                  key={card.name}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left"
                >
                  <p className="text-[10px] font-semibold text-slate-900 line-clamp-1">
                    {card.name}
                  </p>
                  <p className="mt-1 text-[9px] text-slate-600">
                    {card.message || "Aguardando processamento."}
                  </p>
                  <div className="mt-1">
                    {card.status === "idle" && (
                      <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[9px] text-slate-700">
                        Aguardando
                      </span>
                    )}
                    {card.status === "processing" && (
                      <span className="inline-flex items-center rounded-full border border-amber-400 bg-amber-50 px-2 py-0.5 text-[9px] text-amber-800">
                        Processando...
                      </span>
                    )}
                    {card.status === "success" && (
                      <span className="inline-flex items-center rounded-full border border-emerald-500 bg-emerald-50 px-2 py-0.5 text-[9px] text-emerald-800">
                        ✓ Concluído
                      </span>
                    )}
                    {card.status === "error" && (
                      <span className="inline-flex items-center rounded-full border border-rose-500 bg-rose-50 px-2 py-0.5 text-[9px] text-rose-800">
                        ✕ Erro
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold text-slate-800">
              Log em tempo real da importação
            </span>
            {finishedOk && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500 bg-emerald-50 px-2 py-0.5 text-[9px] text-emerald-800">
                <span className="h-3 w-3 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">
                  ✓
                </span>
                Importação concluída
              </span>
            )}
          </div>

          <div className="h-56 rounded-2xl border border-slate-200 bg-slate-950/95 text-[10px] font-mono text-slate-100 overflow-auto p-2.5">
            {logs.length === 0 ? (
              <p className="text-slate-400">
                Nenhuma execução ainda. Ao importar, as etapas aparecerão aqui
                em tempo real.
              </p>
            ) : (
              logs.map((l, idx) => (
                <div
                  key={idx}
                  className={
                    l.type === "error"
                      ? "text-rose-300"
                      : l.type === "success"
                      ? "text-emerald-300"
                      : "text-slate-100"
                  }
                >
                  {l.type === "info" && "[INFO] "}
                  {l.type === "success" && "[OK] "}
                  {l.type === "error" && "[ERRO] "}
                  {l.message}
                </div>
              ))
            )}
          </div>

          <p className="text-[9px] text-slate-500">
            Para cada produto criado ou linha processada, você pode registrar
            mensagens detalhadas aqui a partir da API de importação. Isso
            facilita suporte, auditoria e deixa o SaaS mais transparente para o
            administrador.
          </p>
        </div>
      </div>
    </div>
  );
}