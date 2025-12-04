"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/b2b", label: "Catálogo" },
  { href: "/b2b/sobre", label: "Sobre a distribuidora" },
  { href: "/b2b/contato", label: "Atendimento & contato" }
];

export default function B2BNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4 text-[11px] text-slate-300">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "px-2 py-1 rounded-full border transition",
                active
                  ? "bg-slate-900 text-slate-100 border-slate-700"
                  : "border-transparent hover:bg-slate-900/80 hover:border-slate-700"
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}

        <span className="ml-auto hidden sm:inline text-[10px] text-slate-500">
          Portal B2B demo em desenvolvimento · Integração com estoque, pedidos e financeiro
        </span>
      </div>
    </nav>
  );
}


