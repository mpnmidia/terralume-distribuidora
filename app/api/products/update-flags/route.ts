import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente Supabase só do lado do servidor (não vai pro browser)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const value = String(formData.get("value") ?? "");

  const redirectUrl = new URL("/products", req.url);

  if (!id || !field) {
    console.error("update-flags: dados inválidos", { id, field, value });
    redirectUrl.searchParams.set("error", "invalid");
    return NextResponse.redirect(redirectUrl);
  }

  const updatePayload: Record<string, any> = {};

  if (field === "active" || field === "show_in_b2b" || field === "is_published") {
    const boolValue = value === "true";
    updatePayload[field] = boolValue;

    if (field === "is_published") {
      updatePayload["published_at"] = boolValue ? new Date().toISOString() : null;
    }
  } else {
    console.error("update-flags: campo não suportado", field);
    redirectUrl.searchParams.set("error", "field");
    return NextResponse.redirect(redirectUrl);
  }

  const { error } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar produto via API:", error);
    redirectUrl.searchParams.set("error", error.code ?? "update");
    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.searchParams.set("ok", "1");
  return NextResponse.redirect(redirectUrl);
}
