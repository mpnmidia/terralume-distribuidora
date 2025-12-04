import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const BUCKET_NAME = "produtos_terra_lume";
const COMPANY_ID = "6d6212b8-3ff2-4510-8572-04e1399f8534";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function gerarSkuFallback() {
  const now = Date.now();
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `SKU-${now}-${rand}`;
}

function agoraIso() {
  return new Date().toISOString();
}

async function registrarLog(params: {
  status: "ok" | "erro";
  sku?: string;
  codigo?: string;
  companyId?: string;
  originalName?: string;
  mimeType?: string;
  sizeBytes?: number;
  bucket?: string;
  path?: string;
  publicUrl?: string;
  productRegistered?: boolean;
  errorMessage?: string | null;
  extra?: any;
}) {
  try {
    await supabaseAdmin.from("upload_logs").insert({
      company_id: params.companyId ?? null,
      sku: params.sku ?? null,
      codigo: params.codigo ?? null,
      original_name: params.originalName ?? null,
      mime_type: params.mimeType ?? null,
      size_bytes: params.sizeBytes ?? null,
      bucket: params.bucket ?? null,
      path: params.path ?? null,
      public_url: params.publicUrl ?? null,
      status: params.status,
      product_registered: params.productRegistered ?? null,
      error_message: params.errorMessage ?? null,
      extra: params.extra ?? null,
    });
  } catch (e) {
    console.error("Falha ao registrar log de upload:", e);
  }
}

export async function POST(req: NextRequest) {
  const inicioTotal = Date.now();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as unknown as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo (file) é obrigatório" },
        { status: 400 }
      );
    }

    const originalName = (file as any).name ?? "arquivo_sem_nome";
    const contentType = file.type || "image/jpeg";

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Tipo de arquivo inválido. Use JPG, PNG ou WEBP." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const sizeBytes = arrayBuffer.byteLength;

    if (sizeBytes > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo: 5MB." },
        { status: 400 }
      );
    }

    // 1) Código pode vir do form (codigo, sku, sku_sugerido) ou ser gerado
    const codigoFromForm =
      formData.get("codigo")?.toString().trim() ||
      formData.get("sku")?.toString().trim() ||
      formData.get("sku_sugerido")?.toString().trim() ||
      "";

    let codigo: string;
    let sku: string;
    let skuGeradoViaFuncao = false;

    if (codigoFromForm) {
      codigo = codigoFromForm;
      sku = codigoFromForm;
    } else {
      try {
        const { data: skuData, error: skuError } = await supabaseAdmin.rpc(
          "generate_sku"
        );

        if (skuError || !skuData) {
          console.error(
            "Erro ao gerar SKU via generate_sku, usando fallback:",
            skuError
          );
          sku = gerarSkuFallback();
        } else {
          sku = skuData as string;
          skuGeradoViaFuncao = true;
        }
        codigo = sku;
      } catch (e) {
        console.error("Exceção em generate_sku, usando fallback:", e);
        sku = gerarSkuFallback();
        codigo = sku;
      }
    }

    // 2) Destino do produto: catalogo | b2b | todos
    const destinoRaw =
      formData.get("destino")?.toString().trim().toLowerCase() || "todos";

    let showInB2B = true;
    let isPublished = true;
    let isActive = true;

    if (destinoRaw === "catalogo") {
      showInB2B = false;
      isPublished = false;
      isActive = true;
    } else if (destinoRaw === "b2b") {
      showInB2B = true;
      isPublished = true;
      isActive = true;
    } else {
      // "todos" (catálogo + B2B) como padrão
      showInB2B = true;
      isPublished = true;
      isActive = true;
    }

    // 3) Define extensão do arquivo
    const ext =
      contentType === "image/png"
        ? "png"
        : contentType === "image/webp"
        ? "webp"
        : "jpg";

    const filePath = `${codigo}.${ext}`;
    const buffer = Buffer.from(arrayBuffer);

    // 4) Upload pro bucket
    const inicioUpload = Date.now();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });
    const fimUpload = Date.now();

    if (uploadError) {
      console.error("Erro upload storage:", uploadError);

      await registrarLog({
        status: "erro",
        sku,
        codigo,
        companyId: COMPANY_ID,
        originalName,
        mimeType: contentType,
        sizeBytes,
        bucket: BUCKET_NAME,
        path: filePath,
        publicUrl: null,
        productRegistered: false,
        errorMessage: uploadError.message,
        extra: {
          stage: "upload",
          destino: destinoRaw,
          stage_durations_ms: {
            upload: fimUpload - inicioUpload,
            total: Date.now() - inicioTotal,
          },
        },
      });

      return NextResponse.json(
        {
          error: "Falha ao enviar arquivo para o bucket",
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    // 5) URL pública para o B2B / catálogo
    const publicUrl =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}` +
      `/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;

    // 6) Registrar produto em `products` sem violar a constraint products_company_sku_unique

    let productRegistered = false;
    let productErrorMessage: string | null = null;

    try {
      // 6.1) Tentar localizar produto existente por company_id + (codigo OU sku)
      const { data: existing, error: lookupError } = await supabaseAdmin
        .from("products")
        .select("id, sku, codigo")
        .eq("company_id", COMPANY_ID)
        .or(`codigo.eq.${codigo},sku.eq.${sku}`)
        .limit(1)
        .maybeSingle();

      if (lookupError) {
        console.error("Erro ao buscar produto existente:", lookupError);
      }

      if (existing?.id) {
        // 6.2) Já existe produto -> apenas UPDATE (não faz INSERT)
        const { error: updateError } = await supabaseAdmin
          .from("products")
          .update({
            image_url: publicUrl,
            sku,
            codigo,
            show_in_b2b: showInB2B,
            is_published: isPublished,
            is_active: isActive,
            active: isActive,
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Erro ao atualizar imagem do produto:", updateError);
          productErrorMessage = updateError.message ?? String(updateError);
        } else {
          productRegistered = true;
        }
      } else {
        // 6.3) Não achou nenhum -> tenta INSERT
        const { error: insertError } = await supabaseAdmin
          .from("products")
          .insert({
            company_id: COMPANY_ID,
            name: codigo, // NOT NULL
            codigo,
            sku,
            image_url: publicUrl,
            show_in_b2b: showInB2B,
            is_published: isPublished,
            is_active: isActive,
            active: isActive,
            is_promo: false,
            offer_is_active: false,
          });

        if (insertError) {
          // 23505 = unique_violation (constraint products_company_sku_unique)
          const code = (insertError as any).code;
          if (code === "23505") {
            console.warn(
              "Produto já existia para este company_id + sku; tratando como registrado."
            );
            productRegistered = true;
            productErrorMessage = null;
          } else {
            console.error("Erro insert products:", insertError);
            productErrorMessage =
              insertError.message ?? String(insertError);
          }
        } else {
          productRegistered = true;
        }
      }
    } catch (e: any) {
      console.error("Exceção ao registrar produto:", e);
      productErrorMessage = String(e?.message ?? e);
    }

    const fimTotal = Date.now();

    await registrarLog({
      status: "ok",
      sku,
      codigo,
      companyId: COMPANY_ID,
      originalName,
      mimeType: contentType,
      sizeBytes,
      bucket: BUCKET_NAME,
      path: filePath,
      publicUrl,
      productRegistered,
      errorMessage: productErrorMessage,
      extra: {
        destino: destinoRaw,
        stage_durations_ms: {
          upload: fimUpload - inicioUpload,
          total: fimTotal - inicioTotal,
        },
        timestamps: {
          inicio: new Date(inicioTotal).toISOString(),
          fim: new Date(fimTotal).toISOString(),
        },
      },
    });

    return NextResponse.json({
      ok: true,
      sku,
      codigo,
      imageUrl: publicUrl,
      productRegistered,
      productErrorMessage,
      bucket: BUCKET_NAME,
      path: filePath,
    });
  } catch (err: any) {
    console.error("Erro inesperado upload-product-image-auto:", err);

    await registrarLog({
      status: "erro",
      companyId: COMPANY_ID,
      errorMessage: String(err?.message ?? err),
      extra: {
        stage: "desconhecido",
        thrown_at: agoraIso(),
      },
    });

    return NextResponse.json(
      {
        error: "Erro interno ao processar upload",
        details: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}
