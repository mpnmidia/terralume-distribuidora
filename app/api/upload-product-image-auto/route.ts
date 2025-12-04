import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const BUCKET_NAME = "produtos_terra_lume";
const COMPANY_ID = "6d6212b8-3ff2-4510-8572-04e1399f8534";

// Limites de segurança
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Destino = "catalogo" | "b2b" | "todos";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as unknown as File | null;
    const destinoRaw = (formData.get("destino") as string | null) ?? "catalogo";
    const isOfferRaw = (formData.get("is_offer") as string | null) ?? "false";
    const promoLabelRaw = (formData.get("promo_label") as string | null) ?? "";

    const destino: Destino =
      destinoRaw === "b2b" || destinoRaw === "todos" ? destinoRaw : "catalogo";
    const isOffer = isOfferRaw === "true";
    const promoLabel = promoLabelRaw?.trim() || "OFERTA";

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "Arquivo (file) é obrigatório." },
        { status: 400 }
      );
    }

    // Verifica tipo de arquivo
    if (!ALLOWED_TYPES.includes((file as any).type)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Tipo de arquivo inválido. Use JPG, PNG ou WEBP.",
        },
        { status: 400 }
      );
    }

    // Verifica tamanho
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          ok: false,
          error: "Arquivo muito grande. Máximo permitido: 5MB.",
        },
        { status: 400 }
      );
    }

    // 1) Gera SKU único via função RPC generate_sku
    const { data: skuData, error: skuError } = await supabaseAdmin.rpc(
      "generate_sku"
    );

    if (skuError || !skuData) {
      console.error("Erro ao gerar SKU automático:", skuError);
      return NextResponse.json(
        { ok: false, error: "Falha ao gerar SKU automático." },
        { status: 500 }
      );
    }

    const sku: string = skuData; // Ex.: "SKU-000001"

    // 2) Define extensão pelo content-type
    const fileType = (file as any).type as string;
    const ext =
      fileType === "image/png"
        ? "png"
        : fileType === "image/webp"
        ? "webp"
        : "jpg";

    const filePath = `${sku}.${ext}`;

    // 3) Upload no bucket
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: fileType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Erro upload storage:", uploadError);
      return NextResponse.json(
        {
          ok: false,
          error: "Falha ao enviar arquivo para o bucket.",
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    // 4) Monta URL pública
    const publicUrl =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}` +
      `/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;

    // 5) Define flags de destino
    const is_active = true;
    const active = true;
    const ativo = true;
    const show_in_b2b = destino === "b2b" || destino === "todos";

    // 6) Flags de oferta (opcional)
    const offer_is_active = isOffer;
    const is_promo = isOffer;
    const promo_label = isOffer ? promoLabel : null;

    // 7) Upsert do produto "rascunho" com esse SKU
    const { data: upsertData, error: upsertError } = await supabaseAdmin
      .from("products")
      .upsert(
        {
          company_id: COMPANY_ID,
          sku,
          image_url: publicUrl,
          // flags de visibilidade
          is_active,
          active,
          ativo,
          show_in_b2b,
          // oferta
          offer_is_active,
          is_promo,
          promo_label,
        },
        {
          onConflict: "company_id,sku",
        }
      )
      .select("id")
      .single();

    if (upsertError) {
      console.error("Erro upsert products:", upsertError);
      return NextResponse.json(
        {
          ok: false,
          error: "Falha ao registrar produto na tabela products.",
          details: upsertError.message,
        },
        { status: 500 }
      );
    }

    const logMessageParts: string[] = [];
    logMessageParts.push(`SKU gerado: ${sku}`);
    logMessageParts.push(
      `Destino: ${
        destino === "todos"
          ? "Catálogo + B2B"
          : destino === "b2b"
          ? "B2B"
          : "Catálogo da distribuidora"
      }`
    );
    if (show_in_b2b) {
      logMessageParts.push("Flag show_in_b2b = true");
    } else {
      logMessageParts.push("Flag show_in_b2b = false");
    }
    if (isOffer) {
      logMessageParts.push(`OFERTA ativa (${promoLabel})`);
    }

    const logMessage = logMessageParts.join(" · ");

    return NextResponse.json({
      ok: true,
      sku,
      imageUrl: publicUrl,
      destino,
      productId: upsertData?.id ?? null,
      is_active,
      show_in_b2b,
      is_offer: isOffer,
      promo_label: isOffer ? promoLabel : null,
      log: logMessage,
    });
  } catch (err: any) {
    console.error("Erro inesperado upload-product-image-auto:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Erro interno ao processar upload.",
        details: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}
