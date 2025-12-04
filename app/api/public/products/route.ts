import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const COMPANY_ID = "6d6212b8-3ff2-4510-8572-04e1399f8534";

/**
 * Catálogo público:
 * - Só produtos ativos
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, name, codigo, descricao, image_url, categoria, marca, offer_is_active, promo_label, is_active, show_in_b2b"
      )
      .eq("company_id", COMPANY_ID)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao carregar produtos públicos:", error);
      return NextResponse.json(
        { ok: false, error: "Falha ao carregar produtos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      products: data ?? [],
    });
  } catch (err: any) {
    console.error("Erro inesperado em /api/public/products:", err);
    return NextResponse.json(
      { ok: false, error: "Erro interno ao listar produtos" },
      { status: 500 }
    );
  }
}
