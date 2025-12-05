import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  return NextResponse.json({
    id,
    status: "ok",
    origem: "api",
  });
}
