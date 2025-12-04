import { NextResponse } from "next/server";
import { getCompanyBySlug } from "@/lib/saas-tenant";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      slug,
      name,
      sku,
      category,
      description,
      image_url,
      unit,
      barcode,
      active,
    } = body || {};

    if (!slug || !name) {
      return NextResponse.json(
        { ok: false, error: "slug e nome do produto são obrigatórios." },
        { status: 400 }
      );
    }

    const company = await getCompanyBySlug(slug);
    if (!company) {
      return NextResponse.json(
        { ok: false, error: "Empresa não encontrada para o slug informado." },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        company_id: company.id,
        name,
        sku,
        category,
        description,
        image_url,
        unit,
        barcode,
        is_active: typeof active === "boolean" ? active : true,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao criar produto:", error);
      return NextResponse.json(
        {
          ok: false,
          error: error.message || "Erro ao criar produto.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, productId: data?.id },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Erro inesperado na API de produtos:", err);
    return NextResponse.json(
      { ok: false, error: "Erro inesperado ao criar produto." },
      { status: 500 }
    );
  }
}