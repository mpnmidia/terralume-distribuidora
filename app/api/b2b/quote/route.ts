import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const COMPANY_ID = "6d6212b8-3ff2-4510-8572-04e1399f8534";

type QuoteItem = {
  productId: string;
  quantity: number;
  notes?: string;
};

type QuoteCustomer = {
  name: string;
  email?: string;
  phone?: string;
  document?: string; // CNPJ/CPF
  note?: string;     // observação geral do pedido
};

async function findOrCreateCustomer(customer: QuoteCustomer) {
  const email = customer.email?.trim() || null;

  if (email) {
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("b2b_customers")
      .select("id")
      .eq("company_id", COMPANY_ID)
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("Erro ao buscar cliente B2B:", lookupError);
    }

    if (existing?.id) {
      return existing.id as string;
    }
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("b2b_customers")
    .insert({
      company_id: COMPANY_ID,
      name: customer.name,
      email: customer.email ?? null,
      phone: customer.phone ?? null,
      document: customer.document ?? null,
      status: "prospect",
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("Erro ao criar cliente B2B:", insertError);
    throw new Error("Falha ao registrar cliente B2B");
  }

  return inserted.id as string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = (body.items ?? []) as QuoteItem[];
    const customer = (body.customer ?? {}) as QuoteCustomer;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item no pedido" },
        { status: 400 }
      );
    }

    if (!customer.name || typeof customer.name !== "string") {
      return NextResponse.json(
        { error: "Nome do cliente é obrigatório" },
        { status: 400 }
      );
    }

    const customerId = await findOrCreateCustomer(customer);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("b2b_orders")
      .insert({
        company_id: COMPANY_ID,
        customer_id: customerId,
        type: "quote_request",
        status: "pending_admin_review",
        note: customer.note ?? null,
      })
      .select("id, created_at")
      .single();

    if (orderError || !order) {
      console.error("Erro ao criar pedido B2B:", orderError);
      return NextResponse.json(
        { error: "Falha ao registrar pedido" },
        { status: 500 }
      );
    }

    const itemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      notes: item.notes ?? null,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("b2b_order_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("Erro ao registrar itens do pedido:", itemsError);
      return NextResponse.json(
        { error: "Falha ao registrar itens do pedido" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      createdAt: order.created_at,
    });
  } catch (err: any) {
    console.error("Erro inesperado em /api/b2b/quote:", err);
    return NextResponse.json(
      {
        error: "Erro interno ao registrar pedido",
        details: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}
