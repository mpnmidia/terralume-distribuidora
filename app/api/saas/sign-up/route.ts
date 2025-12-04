import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente admin para inserir na tabela companies
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { ok: false, error: "Configuração de banco incompleta no servidor." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);

  const companyName = String(body?.companyName || "").trim();
  const cnpj = String(body?.cnpj || "").trim();
  const adminName = String(body?.adminName || "").trim();
  const adminEmail = String(body?.adminEmail || "").trim();
  const phone = String(body?.phone || "").trim();

  if (!companyName) {
    return NextResponse.json(
      { ok: false, error: "Informe o nome da distribuidora." },
      { status: 400 }
    );
  }
  if (!adminName) {
    return NextResponse.json(
      { ok: false, error: "Informe o nome do responsável." },
      { status: 400 }
    );
  }
  if (!adminEmail) {
    return NextResponse.json(
      { ok: false, error: "Informe o e-mail do responsável." },
      { status: 400 }
    );
  }

  const slugBase = slugify(companyName || adminName || adminEmail);
  let slug = slugBase || `empresa-${Date.now()}`;

  // Garante que o slug seja único
  for (let i = 0; i < 5; i++) {
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { ok: false, error: "Erro ao verificar disponibilidade do endereço." },
        { status: 500 }
      );
    }
    if (!existing) break;
    slug = `${slugBase}-${Math.floor(Math.random() * 9999)}`;
  }

  const { data, error } = await supabaseAdmin
    .from("companies")
    .insert({
      name: companyName,
      slug,
      cnpj,
      email: adminEmail,
      phone,
      status: "pending", // você pode aprovar depois no painel admin
    })
    .select("id, slug")
    .single();

  if (error) {
    console.error("Erro ao inserir na tabela companies:", error);
    return NextResponse.json(
      { ok: false, error: "Não foi possível criar a conta de distribuidora." },
      { status: 500 }
    );
  }

  // Aqui, em um próximo passo, podemos:
  // - criar usuário owner no Supabase Auth
  // - enviar e-mail de boas vindas
  // - criar registros iniciais (configurações padrão, etc.)

  return NextResponse.json(
    {
      ok: true,
      companyId: data.id,
      slug: data.slug,
      message: "Distribuidora cadastrada com sucesso.",
    },
    { status: 201 }
  );
}