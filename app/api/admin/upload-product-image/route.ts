import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "[upload-product-image] Faltando NEXT_PUBLIC_SUPABASE_URL ou chave (SERVICE_ROLE/ANON)."
      );
      return NextResponse.json(
        {
          error:
            "Configuração do Supabase ausente. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const file = formData.get("file");
    const rawSku = formData.get("sku") as string | null;
    const sku = rawSku?.trim();

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo de imagem não recebido." },
        { status: 400 }
      );
    }

    if (!sku) {
      return NextResponse.json(
        { error: "SKU é obrigatório para vincular a imagem ao produto." },
        { status: 400 }
      );
    }

    const originalName = file.name || "";
    const extMatch = originalName.match(/\.[^.]+$/);
    const ext = extMatch ? extMatch[0].toLowerCase() : ".jpg";

    const bucket = "produtos_terra_lume";
    const path = `${sku}${ext}`; // ex: RIC-TUB-UVA-70.jpg

    // Upload direto do File (compatível com Edge/Node)
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) {
      console.error("[upload-product-image] Erro upload:", uploadError);
      return NextResponse.json(
        { error: "Erro ao enviar imagem para o armazenamento." },
        { status: 500 }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;

    // Atualiza o produto e verifica se alguma linha foi realmente alterada
    const { data, error: updateError } = await supabase
      .from("products")
      .update({ image_url: publicUrl })
      .eq("company_id", "6d6212b8-3ff2-4510-8572-04e1399f8534")
      .eq("sku", sku)
      .select("id");

    if (updateError) {
      console.error("[upload-product-image] Erro update products:", updateError);
      return NextResponse.json(
        {
          error:
            "Imagem enviada, mas houve erro ao atualizar o produto no banco de dados.",
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      // Nenhum produto correspondeu ao SKU informado
      console.warn(
        "[upload-product-image] Nenhum produto encontrado para o SKU:",
        sku
      );
      return NextResponse.json(
        {
          error:
            "Nenhum produto encontrado com esse SKU. Confirme o código cadastrado no sistema (ex.: PET-ROS-COC-500).",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, image_url: publicUrl });
  } catch (err: any) {
    console.error(
      "[upload-product-image] Erro inesperado:",
      err?.message || err
    );
    return NextResponse.json(
      { error: "Erro inesperado no servidor ao processar o upload." },
      { status: 500 }
    );
  }
}
