import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const COMPANY_ID = "6d6212b8-3ff2-4510-8572-04e1399f8534";

/**
 * GET /api/b2b/public-quote-status?id=UUID
 * Retorna informações seguras para o cliente acompanhar o status do pedido.
 * NÃO expõe notas internas do admin.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID da solicitação é obrigatório." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("b2b_quote_requests")
      .select(
        "id, company_id, contact_name, contact_company, contact_email, contact_city, contact_state, contact_notes, status, status_history, items_json, created_at"
      )
      .eq("id", id)
      .eq("company_id", COMPANY_ID)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Solicitação não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, request: data });
  } catch (err: any) {
    console.error("Erro em GET /api/b2b/public-quote-status:", err);
    return NextResponse.json(
      { ok: false, error: "Erro interno ao carregar solicitação." },
      { status: 500 }
    );
  }
}
