"use client";

import React, { useCallback, useState } from "react";

type Destino = "catalogo" | "b2b" | "todos";

type FileStatus = "pending" | "uploading" | "success" | "error";

type UploadItem = {
  id: string;
  file: File;
  status: FileStatus;
  message: string;
  log?: string;
  sku?: string;
  imageUrl?: string;
  destino?: Destino;
};

function statusLabel(status: FileStatus) {
  switch (status) {
    case "pending":
      return "Aguardando envio";
    case "uploading":
      return "Enviando / processando...";
    case "success":
      return "OK";
    case "error":
      return "Erro";
  }
}

export default function AdminUploadImagensAutoPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [destino, setDestino] = useState<Destino>("catalogo");
  const [isOffer, setIsOffer] = useState(false);
  const [promoLabel, setPromoLabel] = useState("OFERTA");
  const [isUploadingAll, setIsUploadingAll] = useState(false);

  const hasFiles = items.length > 0;
  const totalOk = items.filter((i) => i.status === "success").length;
  const totalError = items.filter((i) => i.status === "error").length;

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: UploadItem[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
        .toString(36)
        .slice(2)}`,
      file,
      status: "pending",
      message: "",
    }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    // permite selecionar novamente os mesmos arquivos depois
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function clearList() {
    setItems([]);
  }

  async function uploadSingle(index: number) {
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === index
          ? {
              ...it,
              status: "uploading",
              message: "Enviando arquivo e gerando SKU automático...",
            }
          : it
      )
    );

    const item = items[index];
    if (!item) return;

    const form = new FormData();
    form.append("file", item.file);
    form.append("destino", destino);
    form.append("is_offer", isOffer ? "true" : "false");
    form.append("promo_label", promoLabel);

    try {
      const res = await fetch("/api/upload-product-image-auto", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        const msg: string =
          json?.error ||
          "Falha ao processar upload/registro do produto no backend.";
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === index
              ? {
                  ...it,
                  status: "error",
                  message: msg,
                  log: json?.details || json?.log || "",
                }
              : it
          )
        );
        return;
      }

      const logMsg: string =
        json.log ||
        `SKU ${json.sku ?? ""} gerado e produto registrado com sucesso.`;

      setItems((prev) =>
        prev.map((it, idx) =>
          idx === index
            ? {
                ...it,
                status: "success",
                message: "Upload concluído e produto registrado.",
                log: logMsg,
                sku: json.sku,
                imageUrl: json.imageUrl,
                destino: json.destino,
              }
            : it
        )
      );
    } catch (err: any) {
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === index
            ? {
                ...it,
                status: "error",
                message: "Erro inesperado ao enviar o arquivo.",
                log: String(err?.message ?? err),
              }
            : it
        )
      );
    }
  }

  async function handleUploadAll() {
    if (!items.length) return;
    setIsUploadingAll(true);
    // envia apenas pendentes ou com erro
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === "pending" || item.status === "error") {
        // eslint-disable-next-line no-await-in-loop
        await uploadSingle(i);
      }
    }
    setIsUploadingAll(false);
  }

  function destinoDescricao(d: Destino | undefined) {
    if (!d) return "-";
    if (d === "catalogo") return "Catálogo da distribuidora";
    if (d === "b2b") return "Portal B2B";
    return "Catálogo + B2B";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">
            Upload de imagens de produtos (SKU automático)
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl">
            Arraste as imagens para o quadro abaixo ou selecione os arquivos.
            Para cada imagem, o sistema irá gerar um SKU único, enviar para o
            bucket <span className="font-mono">produtos_terra_lume</span>,
            registrar/atualizar o produto na tabela{" "}
            <span className="font-mono">products</span> e registrar um log
            detalhado para o administrador.
          </p>
          <p className="text-[11px] text-slate-400">
            Este módulo já prepara automaticamente a visibilidade do produto:
            catálogo, B2B ou ambos, de acordo com o destino selecionado.
          </p>
        </header>

        {/* Controles gerais: destino e oferta */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-semibold text-slate-100">
                Destino padrão dos produtos
              </div>
              <p className="text-[11px] text-slate-400 max-w-xl">
                Defina para onde os produtos enviados por este lote irão
                aparecer. Você pode alterar esse destino a qualquer momento
                antes de enviar o lote.
              </p>
            </div>
            <div className="text-[11px] text-slate-400">
              Arquivos na fila: {items.length} · Sucesso: {totalOk} · Erros:{" "}
              {totalError}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-300">
                Destino
              </div>
              <div className="flex flex-col gap-1 text-[11px]">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="destino"
                    value="catalogo"
                    checked={destino === "catalogo"}
                    onChange={() => setDestino("catalogo")}
                  />
                  <span>Somente catálogo da distribuidora</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="destino"
                    value="b2b"
                    checked={destino === "b2b"}
                    onChange={() => setDestino("b2b")}
                  />
                  <span>Somente portal B2B (mostrado nos pedidos de cotação)</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="destino"
                    value="todos"
                    checked={destino === "todos"}
                    onChange={() => setDestino("todos")}
                  />
                  <span>Catálogo + B2B</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-300">
                Oferta (opcional)
              </div>
              <div className="space-y-1">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isOffer}
                    onChange={(e) => setIsOffer(e.target.checked)}
                  />
                  <span>Marcar produtos deste lote como oferta</span>
                </label>
                {isOffer && (
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-400">
                      Rótulo da oferta (ex.:{" "}
                      <span className="font-mono">OFERTA</span>,{" "}
                      <span className="font-mono">PROMOÇÃO</span>,{" "}
                      <span className="font-mono">QUEIMA DE ESTOQUE</span>)
                    </label>
                    <input
                      type="text"
                      value={promoLabel}
                      onChange={(e) => setPromoLabel(e.target.value)}
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px]"
                    />
                  </div>
                )}
                {!isOffer && (
                  <p className="text-[11px] text-slate-500">
                    Caso queira destacar um lote específico como oferta, ative
                    essa opção. Os detalhes de preço continuam sendo definidos
                    em outras telas.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Área de upload */}
        <section className="space-y-4 text-xs">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/40 px-4 py-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/80 hover:bg-slate-900/70 transition-colors"
          >
            <div className="mb-2 text-3xl">📦</div>
            <div className="text-sm font-medium">
              Arraste as imagens aqui
            </div>
            <div className="text-[11px] text-slate-400">
              ou clique para selecionar
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={onInputChange}
              className="mt-4 text-[11px]"
            />
            <div className="mt-3 text-[11px] text-slate-500 max-w-md">
              Formatos aceitos: JPG, PNG, WEBP · Tamanho máximo por arquivo:
              5MB. Cada arquivo será enviado individualmente, com geração de
              SKU e log detalhado para auditoria.
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">
              {items.length} arquivo(s) na fila · {totalOk} com upload OK
            </span>
            <div className="flex gap-2">
              <button
                onClick={clearList}
                disabled={!hasFiles}
                className="px-3 py-1.5 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
              >
                Limpar lista
              </button>
              <button
                onClick={handleUploadAll}
                disabled={!hasFiles || isUploadingAll}
                className="px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {isUploadingAll ? "Enviando lote..." : "Enviar tudo"}
              </button>
            </div>
          </div>

          {/* Tabela de arquivos */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,2.6fr)] text-[11px] bg-slate-900 border-b border-slate-800">
              <div className="px-3 py-2 border-r border-slate-800">
                Arquivo
              </div>
              <div className="px-3 py-2 border-r border-slate-800">
                Status
              </div>
              <div className="px-3 py-2">Mensagem / Log</div>
            </div>
            <div className="max-h-72 overflow-auto">
              {items.length === 0 && (
                <div className="px-3 py-3 text-[11px] text-slate-500">
                  Nenhum arquivo na fila no momento.
                </div>
              )}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,2.6fr)] text-[11px] border-t border-slate-900"
                >
                  <div className="px-3 py-2 border-r border-slate-900">
                    <div className="font-medium line-clamp-1">
                      {item.file.name}
                    </div>
                    <div className="text-slate-500">
                      {(item.file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <div className="px-3 py-2 border-r border-slate-900">
                    <div
                      className={
                        "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] " +
                        (item.status === "success"
                          ? "border-emerald-500/70 text-emerald-300 bg-emerald-900/30"
                          : item.status === "error"
                          ? "border-rose-500/70 text-rose-300 bg-rose-900/30"
                          : item.status === "uploading"
                          ? "border-sky-500/70 text-sky-200 bg-sky-900/30"
                          : "border-slate-600 text-slate-300 bg-slate-800/30")
                      }
                    >
                      {statusLabel(item.status)}
                    </div>
                    {item.sku && (
                      <div className="mt-1 text-slate-400">
                        SKU: {item.sku}
                      </div>
                    )}
                    {item.destino && (
                      <div className="text-slate-500">
                        {destinoDescricao(item.destino)}
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-slate-200">
                      {item.message || "-"}
                    </div>
                    {item.log && (
                      <div className="mt-1 text-slate-400 whitespace-pre-line">
                        {item.log}
                      </div>
                    )}
                    {item.imageUrl && (
                      <div className="mt-1 text-slate-500 truncate">
                        URL imagem:{" "}
                        <span className="font-mono">{item.imageUrl}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
