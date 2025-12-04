import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const COMPANY_ID = "6d6212b8-3ff2-4510-8572-04e1399f8534";

type StatusHistoryItem = {
  status: string;
  at: string;
};

type PatchPayload = {
  id: string;
  status?: string;
  internal_notes?: string;
};

function ensureArray(value: any): StatusHistoryItem[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [];
}

/**
 * GET /api/admin/b2b/quote-requests
 * Lista pedidos de cotação B2B (somente da COMPANY_ID)
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("b2b_quote_requests")
      .select(
        "id, company_id, contact_name, contact_company, contact_email, contact_phone, contact_city, contact_state, contact_notes, items_json, status, created_at, admin_internal_notes, status_history"
      )
      .eq("company_id", COMPANY_ID)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar b2b_quote_requests:", error);
      return NextResponse.json(
        { ok: false, error: "Falha ao carregar pedidos de cotação B2B." },
        { status: 500 }
      );
    }

    // Garante que sempre haja alguma linha do tempo mínima no retorno
    const normalized =
      data?.map((req: any) => {
        let history = ensureArray(req.status_history);
        if (!history.length && req.status && req.created_at) {
          history = [
            {
              status: String(req.status),
              at: new Date(req.created_at).toISOString(),
            },
          ];
        }
        return {
          ...req,
          status_history: history,
        };
      }) ?? [];

    return NextResponse.json({ ok: true, requests: normalized });
  } catch (err: any) {
    console.error("Erro inesperado em GET /api/admin/b2b/quote-requests:", err);
    return NextResponse.json(
      { ok: false, error: "Erro interno ao carregar pedidos B2B." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/b2b/quote-requests
 * Atualiza status e/ou notas internas de um pedido.
 * - Se "status" vier no payload: adiciona entrada na status_history
 * - Se "internal_notes" vier: atualiza campo admin_internal_notes
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as PatchPayload | null;

    if (!body || !body.id) {
      return NextResponse.json(
        { ok: false, error: "ID do pedido é obrigatório." },
        { status: 400 }
      );
    }

    const { id, status, internal_notes } = body;

    // Buscar registro atual para recuperar status_history
    const { data: current, error: fetchError } = await supabaseAdmin
      .from("b2b_quote_requests")
      .select("status, status_history, admin_internal_notes")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      console.error("Erro ao carregar pedido para PATCH:", fetchError);
      return NextResponse.json(
        { ok: false, error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    const updates: any = {};

    // Atualizar notas internas, se enviadas
    if (typeof internal_notes === "string") {
      updates.admin_internal_notes = internal_notes;
    }

    // Atualizar status + linha do tempo, se enviado
    if (typeof status === "string" && status.trim() !== "") {
      const prevHistory = ensureArray(current.status_history);
      const newHistory: StatusHistoryItem[] = [
        ...prevHistory,
        {
          status,
          at: new Date().toISOString(),
        },
      ];

      updates.status = status;
      updates.status_history = newHistory;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Nada para atualizar. Envie ao menos 'status' ou 'internal_notes'.",
        },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("b2b_quote_requests")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      console.error("Erro ao atualizar pedido B2B:", updateError);
      return NextResponse.json(
        { ok: false, error: "Falha ao atualizar o pedido." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(
      "Erro inesperado em PATCH /api/admin/b2b/quote-requests:",
      err
    );
    return NextResponse.json(
      { ok: false, error: "Erro interno ao atualizar o pedido." },
      { status: 500 }
    );
  }
}
