const WHATSAPP = "(31) 99999-9999"; // fictício
const PHONE = "(31) 3333-4444"; // fictício
const EMAIL = "contato@terralume.com.br"; // fictício
const ADDRESS = "Av. Exemplo, 1234 - Belo Horizonte/MG"; // fictício

export const revalidate = 0;

export default function ContatoB2BPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-50">
          Atendimento &amp; contato
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl">
          Centralize aqui os canais oficiais de atendimento da distribuidora.
          O objetivo é facilitar o contato do comprador B2B com o time
          comercial, financeiro e logístico.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            Canal comercial
          </h2>
          <p className="text-slate-300">
            Dúvidas sobre preços, condições comerciais, campanhas e pedidos.
          </p>
          <ul className="space-y-1 text-slate-300">
            <li>WhatsApp: <span className="text-emerald-300">{WHATSAPP}</span></li>
            <li>Telefone: {PHONE}</li>
            <li>E-mail: {EMAIL}</li>
          </ul>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            Endereço e logística
          </h2>
          <p className="text-slate-300">
            Centro de distribuição e área de atendimento.
          </p>
          <p className="text-slate-300">{ADDRESS}</p>
          <p className="text-slate-400 text-[11px]">
            Aqui você pode detalhar horários para recebimento de mercadorias,
            janelas de carregamento e operação do CD.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            Suporte ao portal B2B
          </h2>
          <p className="text-slate-300">
            Canal exclusivo para suporte ao uso do portal B2B (acesso,
            cadastro, dúvidas sobre pedidos online).
          </p>
          <p className="text-slate-300">
            E-mail de suporte: suporte@terralume.com.br (exemplo)
          </p>
        </div>
      </section>

      <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
        <h2 className="text-sm font-semibold text-slate-50">
          Formulário de contato (em breve)
        </h2>
        <p className="text-slate-300">
          Este formulário é apenas visual no momento. Em uma próxima etapa,
          podemos conectá-lo a um backend para envio de e-mail ou abertura de
          chamados internos.
        </p>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">Nome</label>
            <input
              type="text"
              className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="Nome completo"
              disabled
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">E-mail</label>
            <input
              type="email"
              className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="seuemail@empresa.com"
              disabled
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[11px] text-slate-400">Mensagem</label>
            <textarea
              className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400 min-h-[90px]"
              placeholder="Descreva sua dúvida, sugestão ou solicitação."
              disabled
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              disabled
              className="rounded-lg bg-emerald-500/40 text-slate-900 text-[11px] font-semibold px-4 py-2 cursor-not-allowed"
            >
              Enviar mensagem (em breve)
            </button>
          </div>
        </form>

        <p className="text-[11px] text-slate-500">
          Enquanto o formulário não estiver ativo, utilize os canais de contato
          ao lado para falar com a distribuidora.
        </p>
      </section>
    </div>
  );
}



