"use client";

import { useState } from "react";

type Status = "pendente" | "enviando" | "ok" | "erro";

type ItemFila = {
  id: number;
  file: File;
  nomeArquivo: string;
  size: number;
  type: string;
  codigoSugerido?: string;
  status: Status;
  mensagem: string;
  sku?: string;
  codigo?: string;
  imageUrl?: string;
  productRegistered?: boolean;
  productErrorMessage?: string | null;
  startedAt?: string;
  finishedAt?: string;
};

type DestinoEnvio = "catalogo" | "b2b" | "todos";

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(1)} ${sizes[i]}`;
}

function sugerirCodigo(nome: string): string | undefined {
  // tenta achar algo tipo KUK-AMN-CHO-70 no nome
  const match = nome.toUpperCase().match(/([A-Z0-9]+-[A-Z0-9-]+)/);
  return match?.[1];
}

export default function ImagensAutoPage() {
  const [itens, setItens] = useState<ItemFila[]>([]);
  const [counter, setCounter] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [destino, setDestino] = useState<DestinoEnvio>("todos");

  function adicionarArquivos(files: File[]) {
    const novos: ItemFila[] = files.map((file) => {
      const codigoSugerido = sugerirCodigo(file.name);
      return {
        id: counter + Math.random(),
        file,
        nomeArquivo: file.name,
        size: file.size,
        type: file.type || "desconhecido",
        codigoSugerido,
        status: "pendente",
        mensagem: codigoSugerido
          ? `Código sugerido: ${codigoSugerido}`
          : "Aguardando envio...",
      };
    });

    setCounter((c) => c + files.length);
    setItens((atual) => [...atual, ...novos]);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) adicionarArquivos(files);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) adicionarArquivos(files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function limparLista() {
    setItens([]);
  }

  async function enviarTudo() {
    setEnviando(true);
    try {
      const atualizados: ItemFila[] = [];

      for (const item of itens) {
        if (item.status === "ok") {
          atualizados.push(item);
          continue;
        }

        let novo: ItemFila = {
          ...item,
          status: "enviando",
          mensagem: "Enviando...",
          startedAt: new Date().toISOString(),
        };

        try {
          const formData = new FormData();
          formData.append("file", item.file);
          if (item.codigoSugerido) {
            formData.append("sku_sugerido", item.codigoSugerido);
          }
          formData.append("destino", destino); // catálogo / b2b / todos

          const res = await fetch("/api/admin/upload-product-image-auto", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!res.ok || !data.ok) {
            novo.status = "erro";
            novo.mensagem =
              "Erro no upload: " + (data.error || "Falha ao enviar.");
            novo.finishedAt = new Date().toISOString();
          } else {
            novo.status = "ok";
            novo.sku = data.sku;
            novo.codigo = data.codigo;
            novo.imageUrl = data.imageUrl;
            novo.productRegistered = data.productRegistered;
            novo.productErrorMessage = data.productErrorMessage ?? null;
            novo.finishedAt = new Date().toISOString();

            if (data.productRegistered) {
              novo.mensagem = `OK – Código: ${data.codigo} (produto vinculado conforme destino selecionado)`;
            } else if (data.productErrorMessage) {
              novo.mensagem = `Imagem OK – Código: ${data.codigo}, mas houve erro ao registrar/vincular produto.`;
            } else {
              novo.mensagem = `OK – Código: ${data.codigo} (imagem salva, produto ainda não vinculado)`;
            }
          }
        } catch (err: any) {
          novo.status = "erro";
          novo.mensagem = "Erro inesperado ao enviar.";
          novo.finishedAt = new Date().toISOString();
        }

        atualizados.push(novo);
      }

      setItens(atualizados);
    } finally {
      setEnviando(false);
    }
  }

  const totalOk = itens.filter((i) => i.status === "ok").length;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        Upload de imagens de produtos (SKU / Código automático)
      </h1>

      <div className="space-y-2 text-sm text-gray-300">
        <p>
          Este painel automatiza o cadastro de imagens no catálogo interno e no
          B2B. Para cada imagem, o sistema gera/associa um código, envia para o
          bucket de produtos e vincula ao produto na tabela{" "}
          <code className="text-xs bg-black/40 px-1 py-0.5 rounded">
            products
          </code>
          .
        </p>
        <p className="text-xs text-gray-400">
          Você pode escolher se os produtos deste lote vão apenas para o
          catálogo interno, apenas para o B2B ou para ambos.
        </p>
      </div>

      {/* Seletor de destino */}
      <div className="border border-gray-800 rounded-lg p-3 text-sm bg-black/40 space-y-2">
        <div className="font-medium">Destino deste envio</div>
        <p className="text-xs text-gray-400">
          A escolha abaixo vale para todas as imagens deste lote. Você pode
          alterar o destino antes de enviar um novo grupo de arquivos.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-1 text-xs">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name="destino"
              value="catalogo"
              checked={destino === "catalogo"}
              onChange={() => setDestino("catalogo")}
            />
            <span>
              <span className="font-medium">Apenas catálogo interno</span>
              <span className="block text-[11px] text-gray-400">
                Produtos ficam ativos no sistema, mas não aparecem no portal
                B2B.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name="destino"
              value="b2b"
              checked={destino === "b2b"}
              onChange={() => setDestino("b2b")}
            />
            <span>
              <span className="font-medium">Apenas B2B</span>
              <span className="block text-[11px] text-gray-400">
                Focados no catálogo B2B. Continuam cadastrados internamente, mas
                com destaque para o canal B2B.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name="destino"
              value="todos"
              checked={destino === "todos"}
              onChange={() => setDestino("todos")}
            />
            <span>
              <span className="font-medium">Catálogo + B2B</span>
              <span className="block text-[11px] text-gray-400">
                Padrão recomendado: produto visível tanto no catálogo interno
                quanto no portal B2B.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p className="mb-2">📦 Arraste as imagens aqui</p>
        <p className="text-xs text-gray-500 mb-4">
          ou clique para selecionar
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="mx-auto block"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span>
          {itens.length} arquivo(s) na fila · {totalOk} com upload OK
        </span>
        <div className="space-x-2">
          <button
            onClick={limparLista}
            className="px-3 py-1 border rounded text-xs"
          >
            Limpar lista
          </button>
          <button
            onClick={enviarTudo}
            disabled={enviando || itens.length === 0}
            className="px-3 py-1 border rounded text-xs bg-blue-600 text-white disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Enviar tudo"}
          </button>
        </div>
      </div>

      <table className="w-full text-sm border-collapse mt-2">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left p-2">Arquivo</th>
            <th className="text-left p-2">Detalhes</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Mensagem</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.id} className="border-b border-gray-800 align-top">
              <td className="p-2">
                <div className="font-medium">{item.nomeArquivo}</div>
                <div className="text-xs text-gray-500">
                  {formatBytes(item.size)} · {item.type || "tipo desconhecido"}
                </div>
                {item.codigoSugerido && (
                  <div className="text-xs text-amber-400">
                    Código sugerido: {item.codigoSugerido}
                  </div>
                )}
              </td>
              <td className="p-2 text-xs text-gray-400">
                {item.startedAt && (
                  <div>Início: {new Date(item.startedAt).toLocaleString()}</div>
                )}
                {item.finishedAt && (
                  <div>Fim: {new Date(item.finishedAt).toLocaleString()}</div>
                )}
                {item.imageUrl && (
                  <div className="mt-1">
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      className="text-blue-400 underline"
                    >
                      Ver imagem no bucket
                    </a>
                  </div>
                )}
              </td>
              <td className="p-2">
                {item.status === "pendente" && "⏳ Pendente"}
                {item.status === "enviando" && "🚚 Enviando"}
                {item.status === "ok" && "✅ OK"}
                {item.status === "erro" && "❌ Erro"}
                {item.codigo && (
                  <div className="text-xs text-gray-400 mt-1">
                    Código: {item.codigo}
                  </div>
                )}
                {item.sku && (
                  <div className="text-xs text-gray-500">
                    SKU interno: {item.sku}
                  </div>
                )}
              </td>
              <td className="p-2 text-xs">
                <div>{item.mensagem}</div>
                {item.productErrorMessage && (
                  <div className="mt-1 text-red-400">
                    Detalhe técnico: {item.productErrorMessage}
                  </div>
                )}
              </td>
            </tr>
          ))}
          {itens.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="p-4 text-center text-xs text-gray-500"
              >
                Nenhum arquivo na fila.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
