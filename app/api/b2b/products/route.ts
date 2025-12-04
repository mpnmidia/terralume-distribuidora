import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const COMPANY_ID = "6d6212b8-3ff2-4510-8572-04e1399f8534";

/**
 * GET /api/b2b/products
 * Lista produtos disponíveis para o portal B2B (sem preços).
 * - company_id fixo
 * - show_in_b2b = true
 * - is_active = true
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, name, codigo, descricao, image_url, categoria, marca, unidade, unit, fabricante, site_oficial, offer_is_active, promo_label, is_promo, show_in_b2b, is_active, is_published, destaque_semana"
      )
      .eq("company_id", COMPANY_ID)
      .eq("show_in_b2b", true)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao carregar produtos B2B:", error);
      return NextResponse.json(
        { ok: false, error: "Falha ao carregar produtos B2B." },
        { status: 500 }
      );
    }

    let products = data ?? [];

    if (q) {
      const term = q.toLowerCase();
      products = products.filter((p: any) => {
        const haystack = [
          p.name ?? "",
          p.codigo ?? "",
          p.descricao ?? "",
          p.categoria ?? "",
          p.marca ?? "",
          p.fabricante ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    return NextResponse.json({ ok: true, products });
  } catch (err: any) {
    console.error("Erro inesperado em /api/b2b/products:", err);
    return NextResponse.json(
      { ok: false, error: "Erro interno ao listar produtos B2B." },
      { status: 500 }
    );
  }
}
