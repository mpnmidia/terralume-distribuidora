import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { [key: string]: string } }) {
  const id = params?.id ?? null;
  // TODO: implementar lógica real (buscar BD / supabase). Este é um stub para não quebrar o build.
  return NextResponse.json({ ok: true, id, message: "route stub - implemente a lógica" });
}