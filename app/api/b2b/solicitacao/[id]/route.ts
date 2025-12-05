import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params?.id ?? null;
  // TODO: buscar dados reais (BD/Supabase). Este é um stub para não quebrar o build.
  return NextResponse.json({ ok: true, id, status: "pendente" });
}
