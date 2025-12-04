import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const COMPANY_ID = "6d6212b8-3ff2-4510-8572-04e1399f8534";

type QuoteItem = {
  productId: string;
  codigo: string;
  name: string;
  quantity: number;
};

type QuotePayload = {
  contact_name: string;
  contact_company?: string | null;
  contact_email: string;
  contact_phone?: string | null;
  contact_city?: string | null;
  contact_state?: string | null;
  contact_notes?: string | null;
  items: QuoteItem[];
};

/**
 * POST /api/b2b/quote-request
 * Recebe um pedido de cotação do portal B2B e grava em b2b_quote_requests.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuotePayload | null;

    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Corpo da requisição vazio." },
        { status: 400 }
      );
    }

    const {
      contact_name,
      contact_company,
      contact_email,
      contact_phone,
      contact_city,
      contact_state,
      contact_notes,
      items,
    } = body;

    if (!contact_name || !contact_email) {
      return NextResponse.json(
        {
          ok: false,
          error: "Nome do contato e e-mail são obrigatórios.",
        },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Necessário informar ao menos 1 item no pedido." },
        { status: 400 }
      );
    }

    const sanitizedItems = items
      .map((item) => ({
        productId: String(item.productId || "").trim(),
        codigo: String(item.codigo || "").trim(),
        name: String(item.name || "").trim(),
        quantity: Number(item.quantity || 0),
      }))
      .filter((i) => i.productId && i.quantity > 0);

    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Nenhum item válido encontrado no pedido.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("b2b_quote_requests").insert({
      company_id: COMPANY_ID,
      contact_name,
      contact_company: contact_company || null,
      contact_email,
      contact_phone: contact_phone || null,
      contact_city: contact_city || null,
      contact_state: contact_state || null,
      contact_notes: contact_notes || null,
      items_json: sanitizedItems,
      status: "pending",
    });

    if (error) {
      console.error("Erro ao gravar b2b_quote_requests:", error);
      return NextResponse.json(
        { ok: false, error: "Falha ao registrar o pedido de cotação." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Erro inesperado em POST /api/b2b/quote-request:", err);
    return NextResponse.json(
      { ok: false, error: "Erro interno ao registrar o pedido." },
      { status: 500 }
    );
  }
}
