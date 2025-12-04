"use client";

import { useState } from "react";

type ItemFila = {
  id: number;
  file: File;
  nomeArquivo: string;
  status: "pendente" | "verificando" | "ok" | "erro";
  mensagem: string;
};

async function verificarArquivo(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/verify-upload", {
    method: "POST",
    body: form,
  });

  const json = await res.json();
  return json;
}

export default function UploadImagensProdutoPage() {
  const [itens, setItens] = useState<ItemFila[]>([]);
  const [counter, setCounter] = useState(0);
  const [enviando, setEnviando] = useState(false);

  // Quando o usuário seleciona os arquivos pelo input
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    adicionarArquivos(files);
  }

  // Quando o usuário arrasta e solta
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files ?? []);
    adicionarArquivos(files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  // Adiciona arquivos à fila e já dispara a verificação automática
  function adicionarArquivos(files: File[]) {
    const novosItens: ItemFila[] = files.map((file) => ({
      id: counter + Math.random(),
      file,
      nomeArquivo: file.name,
      status: "pendente",
      mensagem: "Aguardando verificação...",
    }));

    setCounter((c) => c + files.length);
    setItens((atual) => {
      const lista = [...atual, ...novosItens];
      // dispara verificação para os novos
      novosItens.forEach((item) => verificarItem(item));
      return lista;
    });
  }

  // Faz a chamada para /api/verify-upload e atualiza o status
  async function verificarItem(item: ItemFila) {
    setItens((atual) =>
      atual.map((it) =>
        it.id === item.id
          ? { ...it, status: "verificando", mensagem: "Verificando..." }
          : it
      )
    );

    try {
      const res = await verificarArquivo(item.file);

      if (res.ok) {
        setItens((atual) =>
          atual.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: "ok",
                  mensagem: `OK – SKU: ${res.sku ?? "detectado"} ✔`,
                }
              : it
          )
        );
      } else {
        setItens((atual) =>
          atual.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: "erro",
                  mensagem:
                    "Erro: " +
                    (res.error || "Falha na validação do arquivo."),
                }
              : it
          )
        );
      }
    } catch (e: any) {
      setItens((atual) =>
        atual.map((it) =>
          it.id === item.id
            ? {
                ...it,
                status: "erro",
                mensagem: "Erro inesperado ao verificar o arquivo.",
              }
            : it
        )
      );
    }
  }

  function limparLista() {
    setItens([]);
  }

  // Aqui você futuramente chama sua rota real de upload
  async function enviarTudo() {
    setEnviando(true);
    try {
      const itensValidos = itens.filter((i) => i.status === "ok");

      // Exemplo: aqui você poderia chamar /api/admin/upload-product-image
      // para cada item OK.
      // Por enquanto, só simulo:
      console.log("Pronto para enviar de verdade:", itensValidos);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        Upload de imagens de produtos (com verificação automática)
      </h1>

      <p className="text-sm text-gray-600">
        Arraste as imagens para o quadro abaixo ou selecione os arquivos. Cada
        imagem será verificada automaticamente pela API{" "}
        <code>/api/verify-upload</code> antes de ser enviada de fato ao
        armazenamento.
      </p>

      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p className="mb-2">📦 Arraste as imagens aqui</p>
        <p className="text-xs text-gray-500 mb-4">ou clique para selecionar</p>
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
          {itens.length} arquivo(s) na fila ·{" "}
          {itens.filter((i) => i.status === "ok").length} pronto(s) para envio
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
            disabled={enviando || itens.filter((i) => i.status === "ok").length === 0}
            className="px-3 py-1 border rounded text-xs bg-blue-600 text-white disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Enviar tudo"}
          </button>
        </div>
      </div>

      <table className="w-full text-sm border-collapse mt-2">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Arquivo</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Mensagem</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.nomeArquivo}</td>
              <td className="p-2">
                {item.status === "pendente" && "⏳ Pendente"}
                {item.status === "verificando" && "🔎 Verificando"}
                {item.status === "ok" && "✅ OK"}
                {item.status === "erro" && "❌ Erro"}
              </td>
              <td className="p-2">{item.mensagem}</td>
            </tr>
          ))}
          {itens.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-xs text-gray-500">
                Nenhum arquivo na fila.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
