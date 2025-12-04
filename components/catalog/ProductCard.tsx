"use client";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  unit_price: number | null;
  image_url: string | null;
  offer_image_url: string | null;
};

export function ProductCard({ product }: { product: Product }) {
  const imgSrc = product.offer_image_url || product.image_url;
  const price = product.unit_price ?? 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3 hover:border-emerald-500/70 hover:shadow-lg hover:shadow-emerald-500/10 transition">
      <div className="flex justify-center">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="h-40 w-auto rounded-lg bg-slate-950 object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-lg bg-slate-950 text-xs text-slate-500">
            Sem imagem
          </div>
        )}
      </div>

      <p className="text-sm font-semibold text-slate-50 line-clamp-2">
        {product.name}
      </p>

      {product.sku && (
        <p className="text-[11px] font-mono text-slate-500">
          código: {product.sku}
        </p>
      )}

      <p className="text-sm font-bold text-emerald-300">
        {price > 0 ? `R$ ${price.toFixed(2)}` : "Consulte preço"}
      </p>
    </div>
  );
}
