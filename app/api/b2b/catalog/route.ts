import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro Supabase catálogo B2B:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao carregar produtos do catálogo." },
        { status: 500 }
      );
    }

    const products = (data ?? []).map((p: any) => ({
      id: p.id,
      name: p.name ?? p.nome ?? "Produto",
      sku: p.sku ?? p.codigo ?? "",
      image_url:
        p.image_url ??
        p.imageUrl ??
        p.url_imagem ??
        p.picture_url ??
        null,
      is_offer:
        p.is_offer ??
        p.em_oferta ??
        p.promo ??
        false,
      category_name:
        p.category_name ??
        p.categoria_nome ??
        null,
    }));

    return NextResponse.json({ ok: true, products });
  } catch (err) {
    console.error("Erro inesperado no catálogo B2B:", err);
    return NextResponse.json(
      { ok: false, error: "Erro inesperado ao carregar o catálogo B2B." },
      { status: 500 }
    );
  }
}
