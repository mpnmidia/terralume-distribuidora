import type { ReactNode } from "react";
import B2BNav from "./B2BNav";

const COMPANY_NAME = "Terra Lume Distribuidora";
const SLOGAN = "Distribuidora especializada para varejo e atacado alimentar.";
const PHONE = "(31) 3333-4444"; // fictício, depois você troca
const WHATSAPP = "(31) 99999-9999"; // fictício
const EMAIL = "contato@terralume.com.br"; // fictício
const ADDRESS = "Av. Exemplo, 1234 - Belo Horizonte/MG"; // fictício
const CNPJ = "00.000.000/0000-00"; // fictício

export default function B2BLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      {/* TOPO */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
              <img
                src="https://kjpkflmdlifbwfvchzla.supabase.co/storage/v1/object/public/terra_lume_produtos/terra-lume-logo.png"
                alt={COMPANY_NAME}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{COMPANY_NAME}</div>
              <div className="text-[11px] text-slate-400">{SLOGAN}</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-300">
            <div className="text-right leading-tight">
              <div>
                WhatsApp:{" "}
                <span className="text-emerald-300">{WHATSAPP}</span>
              </div>
              <div>Telefone: {PHONE}</div>
            </div>
            <button
              type="button"
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-200 hover:bg-emerald-500/20 transition"
            >
              Área do cliente (em breve)
            </button>
          </div>
        </div>

        <B2BNav />
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1">{children}</div>

      {/* RODAPÉ */}
      <footer className="border-t border-slate-800 bg-slate-950/95 mt-8">
        <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-slate-400">
          <div className="space-y-1">
            <div className="text-slate-200 font-semibold text-xs">
              {COMPANY_NAME}
            </div>
            <div>{SLOGAN}</div>
            <div className="mt-2">
              CNPJ: <span className="text-slate-200">{CNPJ}</span>
            </div>
            <div>{ADDRESS}</div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-200 font-semibold text-xs">
              Contato comercial
            </div>
            <div>
              WhatsApp:{" "}
              <span className="text-emerald-300">{WHATSAPP}</span>
            </div>
            <div>Telefone: {PHONE}</div>
            <div>E-mail: {EMAIL}</div>
            <div className="mt-2 text-slate-500">
              Horário de atendimento: seg a sex, 8h às 18h (exemplo)
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-200 font-semibold text-xs">
              Informações para o cliente B2B
            </div>
            <ul className="space-y-1">
              <li>• Pedido mínimo: a definir</li>
              <li>• Condições de pagamento: a definir</li>
              <li>• Regiões de entrega: MG (exemplo)</li>
              <li>• Prazos de entrega: a definir</li>
            </ul>
            <div className="mt-2 text-slate-500">
              Estes textos são fictícios e podem ser personalizados diretamente no código.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 text-[10px] text-slate-500 text-center py-2">
          © {new Date().getFullYear()} {COMPANY_NAME}. Todos os direitos reservados. · Portal B2B demo.
        </div>
      </footer>
    </div>
  );
}


