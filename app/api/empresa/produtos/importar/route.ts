import { NextResponse } from "next/server";
import { getCompanyBySlug } from "@/lib/saas-tenant";
// import { supabaseAdmin } from "@/lib/supabase-admin"; // use quando for realmente criar produtos em massa

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const slug = formData.get("slug");

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { ok: false, error: "Slug da empresa é obrigatório." },
        { status: 400 }
      );
    }

    const company = await getCompanyBySlug(slug);
    if (!company) {
      return NextResponse.json(
        { ok: false, error: "Empresa não encontrada para o slug informado." },
        { status: 404 }
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Nenhum arquivo foi enviado para importação." },
        { status: 400 }
      );
    }

    const logs: string[] = [];

    logs.push(`Empresa: ${company.name} (${company.id})`);
    logs.push(`Arquivo recebido: ${file.name}`);
    logs.push(
      "IMPORTANTE: aqui é o ponto para conectar o módulo inteligente que você já tinha (leitura de planilha, classificação por imagem, geração de SKU etc.)."
    );

    // Exemplo de simulação de processamento.
    // Substitua este bloco pela sua lógica real de importação em massa.
    logs.push("Simulação: lendo linhas do arquivo...");
    logs.push("Simulação: 10 linhas identificadas (exemplo).");
    logs.push("Simulação: gerando SKUs automáticos para cada linha...");
    logs.push(
      "Simulação: produtos seriam criados na tabela 'products' com company_id desta empresa."
    );

    const createdCount = 0; // altere para o número real quando implementar a importação

    return NextResponse.json(
      {
        ok: true,
        logs,
        created: createdCount,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Erro inesperado na importação de produtos:", err);
    return NextResponse.json(
      { ok: false, error: "Erro inesperado durante a importação de produtos." },
      { status: 500 }
    );
  }
}