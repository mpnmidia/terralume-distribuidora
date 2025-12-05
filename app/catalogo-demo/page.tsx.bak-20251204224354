import CatalogoClient from "../catalogo/CatalogoClient";
import type { ProductRow } from "../catalogo/page";

export const revalidate = 0;

const demoProducts: ProductRow[] = [
  {
    id: "demo-1",
    name: "Café Torrado e Moído 500g",
    sku: "CAF-500",
    image_url: "https://via.placeholder.com/400x400.png?text=Cafe+500g",
    offer_image_url: null,
    offer_is_active: false,
    unit_price: 18.9,
    promo_price: null,
  } as any,
  {
    id: "demo-2",
    name: "Biscoito Recheado Chocolate 140g",
    sku: "BIS-CHO-140",
    image_url: "https://via.placeholder.com/400x400.png?text=Biscoito+Choc",
    offer_image_url: null,
    offer_is_active: true,
    unit_price: 4.5,
    promo_price: 3.8,
  } as any,
  {
    id: "demo-3",
    name: "Suco de Laranja 1L",
    sku: "SUC-LAR-1L",
    image_url: "https://via.placeholder.com/400x400.png?text=Suco+Laranja",
    offer_image_url: null,
    offer_is_active: false,
    unit_price: 7.2,
    promo_price: null,
  } as any,
];

export default function CatalogoDemoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-4">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Demonstração
          </p>
          <h1 className="text-2xl font-semibold text-slate-50">
            Catálogo de produtos (demo)
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Esta é uma visualização de exemplo do catálogo B2B que seus clientes
            e representantes terão acesso. Os dados abaixo são fictícios.
          </p>
        </header>

        <CatalogoClient initialProducts={demoProducts} showPrices={true} />
      </div>
    </main>
  );
}
