import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Distribuidora SaaS",
  description:
    "Plataforma moderna para gestão de distribuidoras de massas, doces e alimentos embalados."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}

