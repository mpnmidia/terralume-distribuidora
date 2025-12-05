import { redirect } from "next/navigation";

type PageProps = {
  params: { slug: string };
};

const SLUG_ROUTES: Record<string, string> = {
  "terra-lume-dist": "/b2b",
};

export default function EmpresaB2BCatalogRedirect({ params }: PageProps) {
  const slug = params.slug;
  const target = SLUG_ROUTES[slug];

  if (!target) {
    // Se for um slug desconhecido, manda para home (pode trocar depois)
    redirect("/");
  }

  redirect(target);
}