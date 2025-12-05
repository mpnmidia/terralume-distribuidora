import { redirect } from "next/navigation";

type PageProps = {
  params: { slug: string; id: string };
};

const SLUG_ENABLED: Record<string, boolean> = {
  "terra-lume-dist": true,
};

export default function EmpresaB2BSolicitacaoRedirect({ params }: PageProps) {
  const { slug, id } = params;

  if (!SLUG_ENABLED[slug]) {
    redirect("/");
  }

  // Reaproveita a página pública existente de acompanhamento
  redirect(`/b2b/solicitacao/${encodeURIComponent(id)}`);
}