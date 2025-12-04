import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type CsvProduct = {
  name: string;
  sku?: string | null;
  category?: string | null;
  unit?: string | null;
  description?: string | null;
  unit_price?: number | null;
  promo_price?: number | null;
  offer_is_active?: boolean | null;
  image_url?: string | null;
  offer_image_url?: string | null;
};

function parseNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const normalized = raw.replace(/\./g, "").replace(/,/g, ".").trim();
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function parseBoolean(raw: string | undefined): boolean | null {
  if (!raw) return null;
  const t = raw.trim().toLowerCase();
  if (["1", "true", "sim", "yes", "y"].includes(t)) return true;
  if (["0", "false", "nao", "não", "no", "n"].includes(t)) return false;
  return null;
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Arquivo CSV não enviado (campo 'file')." },
      { status: 400 }
    );
  }

  const text = await file.text();

  if (!text.trim()) {
    return NextResponse.json(
      { error: "Arquivo CSV vazio." },
      { status: 400 }
    );
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return NextResponse.json(
      { error: "CSV precisa ter cabeçalho + pelo menos 1 linha de dados." },
      { status: 400 }
    );
  }

  const headerLine = lines[0];
  const separator = headerLine.includes(";") ? ";" : ",";
  const headers = headerLine
    .split(separator)
    .map((h) => h.trim().toLowerCase());

  function colIndex(name: string): number {
    return headers.indexOf(name.toLowerCase());
  }

  const idxName = colIndex("name");
  if (idxName === -1) {
    return NextResponse.json(
      { error: "Cabeçalho precisa ter a coluna 'name'." },
      { status: 400 }
    );
  }

  const idxSku = colIndex("sku");
  const idxCategory = colIndex("category");
  const idxUnit = colIndex("unit");
  const idxDescription = colIndex("description");
  const idxUnitPrice = colIndex("unit_price");
  const idxPromoPrice = colIndex("promo_price");
  const idxOffer = colIndex("offer_is_active");
  const idxImage = colIndex("image_url");
  const idxOfferImage = colIndex("offer_image_url");

  const products: CsvProduct[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(separator);

    const get = (idx: number): string | undefined =>
      idx >= 0 && idx < cols.length ? cols[idx].trim() : undefined;

    const rawName = get(idxName);
    if (!rawName) {
      errors.push(`Linha ${i + 1}: campo "name" vazio, linha ignorada.`);
      continue;
    }

    const product: CsvProduct = {
      name: rawName,
      sku: idxSku >= 0 ? get(idxSku) ?? null : null,
      category: idxCategory >= 0 ? get(idxCategory) ?? null : null,
      unit: idxUnit >= 0 ? get(idxUnit) ?? null : null,
      description: idxDescription >= 0 ? get(idxDescription) ?? null : null,
      unit_price: parseNumber(idxUnitPrice >= 0 ? get(idxUnitPrice) : undefined),
      promo_price: parseNumber(idxPromoPrice >= 0 ? get(idxPromoPrice) : undefined),
      offer_is_active: parseBoolean(idxOffer >= 0 ? get(idxOffer) : undefined),
      image_url: idxImage >= 0 ? get(idxImage) ?? null : null,
      offer_image_url: idxOfferImage >= 0 ? get(idxOfferImage) ?? null : null,
    };

    products.push(product);
  }

  if (products.length === 0) {
    return NextResponse.json(
      { error: "Nenhuma linha válida encontrada no CSV.", details: errors },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .upsert(products, {
      onConflict: "sku",
    })
    .select("id");

  if (error) {
    console.error("Erro ao importar CSV:", error);
    return NextResponse.json(
      { error: "Erro ao salvar produtos no Supabase.", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Importação concluída.",
    imported: products.length,
    saved: data?.length ?? 0,
    errors,
  });
}
