import { supabaseAdmin } from "@/lib/supabase-admin";

export type SaasCompany = {
  id: string;
  name: string;
  slug: string;
  status: string | null;
};

export async function getCompanyBySlug(slug: string): Promise<SaasCompany | null> {
  if (!slug) return null;

  const { data, error } = await supabaseAdmin
    .from("companies")
    .select("id, name, slug, status")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar empresa por slug:", error);
    return null;
  }

  if (!data) return null;

  return data as SaasCompany;
}