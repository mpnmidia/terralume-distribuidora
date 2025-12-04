import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage.listBuckets();

  return NextResponse.json({ buckets: data, error });
}
