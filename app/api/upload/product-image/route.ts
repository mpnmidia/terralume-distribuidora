import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const productId = formData.get("productId");
    const role = (formData.get("role") as string) || "main";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo não enviado." },
        { status: 400 }
      );
    }

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "ID do produto não informado." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // bucket oficial de imagens
    const storage = supabase.storage.from("produtos_terra_lume");

    // converte File -> Buffer (para rodar no backend Node)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

    // ❗ sem template string pra não dar problema com PowerShell
    const path =
      productId +
      "/" +
      Date.now().toString() +
      "-" +
      role +
      "-" +
      safeName;

    const { data, error } = await storage.upload(path, buffer, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

    if (error || !data) {
      console.error("[api/upload] Erro Storage:", error?.message);
      return NextResponse.json(
        { error: error?.message ?? "Erro ao enviar arquivo para Storage." },
        { status: 500 }
      );
    }

    const { data: publicData } = storage.getPublicUrl(data.path);
    const publicUrl = publicData.publicUrl;

    const update: Record<string, string | null> = {};
    if (role === "offer") {
      update["offer_image_url"] = publicUrl;
    } else {
      update["image_url"] = publicUrl;
    }

    const { error: dbError } = await supabase
      .from("products")
      .update(update)
      .eq("id", productId);

    if (dbError) {
      console.error("[api/upload] Erro DB:", dbError.message);
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ publicUrl });
  } catch (err: any) {
    console.error("[api/upload] Erro inesperado:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro inesperado ao processar o upload." },
      { status: 500 }
    );
  }
}
