import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import ProductMediaManager from "./ProductMediaManager";

export const revalidate = 0;

export type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  image_url: string | null;
  offer_image_url: string | null;
};

export default async function ProductMediaPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, image_url, offer_image_url")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao carregar produtos no painel de imagens:", error.message);
  }

  return <ProductMediaManager initialProducts={data ?? []} />;
}
