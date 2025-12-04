import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const productId = body.productId as string | undefined;
    const image_url = (body.image_url as string | null) ?? null;
    const offer_image_url = (body.offer_image_url as string | null) ?? null;
    const offer_is_active = Boolean(body.offer_is_active);

    if (!productId) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("products")
      .update({
        image_url,
        offer_image_url,
        offer_is_active,
      })
      .eq("id", productId)
      .select(
        [
          "id",
          "name",
          "sku",
          "image_url",
          "offer_image_url",
          "offer_is_active",
        ].join(",")
      )
      .single();

    if (error) {
      console.error("Erro ao atualizar imagens do produto:", error);
      return NextResponse.json(
        { error: "Erro ao atualizar imagens do produto." },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: data }, { status: 200 });
  } catch (e: any) {
    console.error("Erro inesperado na API /products/media:", e);
    return NextResponse.json(
      { error: "Erro inesperado ao processar a requisição." },
      { status: 500 }
    );
  }
}
