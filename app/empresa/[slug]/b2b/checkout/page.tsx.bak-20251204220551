import { redirect } from "next/navigation";

type PageProps = {
  params: { slug: string };
};

const SLUG_ROUTES: Record<string, string> = {
  "terra-lume-dist": "/b2b/checkout",
};

export default function EmpresaB2BCheckoutRedirect({ params }: PageProps) {
  const slug = params.slug;
  const target = SLUG_ROUTES[slug];

  if (!target) {
    redirect("/");
  }

  redirect(target);
}