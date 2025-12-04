import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type IncomingItem = {
  productId?: string;
  id?: string;
  name?: string;
  nome?: string;
  sku?: string;
  codigo?: string;
  code?: string;
  quantity?: number;
  qtd?: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Normaliza campos vindos do frontend
    const contactName = String(
      body.contact_name ??
      body.contactName ??
      body.nome_contato ??
      body.nome ??
      ""
    ).trim();

    const contactEmail = String(
      body.contact_email ??
      body.contactEmail ??
      body.email ??
      ""
    ).trim();

    const contactCompany = (body.contact_company ??
      body.company ??
      body.empresa ??
      "") as string;

    const contactPhone = (body.contact_phone ??
      body.phone ??
      body.telefone ??
      "") as string;

    const contactCity = (body.contact_city ??
      body.city ??
      body.cidade ??
      "") as string;

    const contactState = (body.contact_state ??
      body.state ??
      body.uf ??
      "") as string;

    const contactNotes = (body.contact_notes ??
      body.notes ??
      body.observacoes ??
      "") as string;

    const rawItems: IncomingItem[] = Array.isArray(body.items)
      ? body.items
      : [];

    const items = rawItems
      .map((item) => ({
        productId: String(item.productId ?? item.id ?? ""),
        name: String(item.name ?? item.nome ?? "Produto"),
        codigo: String(item.sku ?? item.codigo ?? item.code ?? ""),
        quantity: Number(item.quantity ?? item.qtd ?? 1),
      }))
      .filter((i) => i.productId);

    // Validações básicas
    if (!contactName || !contactEmail) {
      return NextResponse.json(
        { ok: false, error: "Nome do contato e e-mail são obrigatórios." },
        { status: 400 }
      );
    }

    if (!items.length) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Nenhum item foi enviado na solicitação de cotação.",
        },
        { status: 400 }
      );
    }

    const id =
      (body.id && String(body.id)) ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

    const nowIso = new Date().toISOString();

    const statusHistory = [
      {
        status: "pending",
        at: nowIso,
      },
    ];

    const { error } = await supabaseAdmin.from("b2b_quote_requests").insert({
      company_id: "6137892f-37b8-404f-83f7-9a2bbe9e4734",
      id,
      contact_name: contactName,
      contact_company: contactCompany || null,
      contact_email: contactEmail,
      contact_phone: contactPhone || null,
      contact_city: contactCity || null,
      contact_state: contactState || null,
      contact_notes: contactNotes || null,
      status: "pending",
      status_history: statusHistory,
      items_json: items,
    });

    if (error) {
      console.error("Erro ao salvar b2b_quote_requests:", error);
      return NextResponse.json(
        {
          ok: false,
          error:
            "Erro ao registrar sua solicitação de cotação. Tente novamente em instantes.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erro inesperado em /api/b2b/send-quote-request:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Erro inesperado ao enviar a solicitação de cotação. Tente novamente em instantes.",
      },
      { status: 500 }
    );
  }
}
