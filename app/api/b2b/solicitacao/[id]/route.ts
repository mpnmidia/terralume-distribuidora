import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const rawId = params?.id || "";
    const id = decodeURIComponent(rawId).replace(/^#/, "").trim();
    // Aqui você pode buscar no supabaseAdmin se quiser.
    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (err: any) {
    console.error("Erro em API /api/b2b/solicitacao/[id]:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}