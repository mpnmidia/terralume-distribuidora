import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, image_url, offer_image_url } = body ?? {};

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "ID do produto não informado." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("products")
      .update({
        image_url: image_url ?? null,
        offer_image_url: offer_image_url ?? null,
      })
      .eq("id", productId);

    if (error) {
      console.error("[api/save] Erro ao atualizar URLs de imagem:", error.message);
      return NextResponse.json(
        { error: "Erro ao salvar URLs de imagem." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[api/save] Erro inesperado:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro inesperado ao salvar URLs." },
      { status: 500 }
    );
  }
}
