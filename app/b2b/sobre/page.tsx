export const revalidate = 0;

export default function SobreDistribuidoraPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-50">
          Sobre a Doce &amp; Massa Distribuidora
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl">
          Esta página apresenta um texto institucional modelo para o portal B2B.
          Você pode personalizar livremente, mantendo a estrutura pensada para
          uma distribuidora moderna que atende o varejo alimentar.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            Quem somos
          </h2>
          <p className="text-slate-300">
            A Doce &amp; Massa Distribuidora é especializada no atendimento ao
            pequeno e médio varejo, oferecendo um mix selecionado de produtos
            para supermercados, mercearias, padarias, conveniências e outros
            pontos de venda.
          </p>
          <p className="text-slate-300">
            Nosso compromisso é aproximar indústria e varejo, garantindo
            disponibilidade de estoque, regularidade de entrega e um
            relacionamento comercial transparente e de longo prazo.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            Missão, visão e valores
          </h2>
          <ul className="space-y-1 text-slate-300">
            <li>
              <span className="font-semibold text-slate-100">Missão:</span>{" "}
              abastecer o varejo com agilidade, preço competitivo e qualidade
              constante.
            </li>
            <li>
              <span className="font-semibold text-slate-100">Visão:</span>{" "}
              ser referência regional em distribuição, com atendimento
              consultivo e uso intensivo de tecnologia.
            </li>
            <li>
              <span className="font-semibold text-slate-100">Valores:</span>{" "}
              ética, compromisso com o cliente, foco em resultado e respeito à
              cadeia produtiva.
            </li>
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-50">
            Segmentos atendidos
          </h3>
          <ul className="space-y-1 text-slate-300">
            <li>• Supermercados e atacarejos</li>
            <li>• Mercearias e empórios</li>
            <li>• Padarias e confeitarias</li>
            <li>• Lojas de conveniência</li>
            <li>• Food service em geral</li>
          </ul>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-50">
            Marcas e portfólio
          </h3>
          <p className="text-slate-300">
            Trabalhamos com um portfólio de marcas selecionadas, com foco em
            giro, margem e posicionamento adequado para o varejo de vizinhança.
            Este espaço pode destacar as principais marcas e categorias
            trabalhadas pela sua distribuidora.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-50">
            Logística e cobertura
          </h3>
          <p className="text-slate-300">
            A operação logística é planejada para otimizar giro de estoque e
            garantir entregas dentro dos prazos combinados, com rotas fixas e
            calendário de visitas dos vendedores.
          </p>
          <p className="text-slate-300">
            Aqui você pode detalhar regiões atendidas, prazos médios e dias de
            entrega por cidade.
          </p>
        </div>
      </section>

      <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
        <h3 className="text-sm font-semibold text-slate-50">
          Política comercial (modelo)
        </h3>
        <ul className="space-y-1 text-slate-300">
          <li>• Pedido mínimo: informar valor ou quantidade de itens.</li>
          <li>• Condições de pagamento: prazos, formas, antecipação.</li>
          <li>• Política de trocas e devoluções.</li>
          <li>• Regras para campanhas, verbas e incentivos.</li>
        </ul>
        <p className="text-slate-400 text-[11px]">
          Todos os textos desta página são exemplos. Você pode adaptar para a
          realidade da sua distribuidora, mantendo a organização em blocos
          claros para o cliente B2B.
        </p>
      </section>
    </div>
  );
}


