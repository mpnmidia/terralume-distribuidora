import Link from "next/link";

export const revalidate = 0;

export default function TerraLumePublicPage() {
  return (
    <div className="space-y-6 text-[11px]">
      {/* HERO PRINCIPAL */}
      <section className="grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)] gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-emerald-50 p-4 shadow-lg shadow-emerald-900/40">
          <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200 mb-1">
            Portal do lojista · Terra Lume Distribuidora
          </div>
          <h1 className="text-[20px] md:text-[22px] font-semibold leading-snug mb-2">
            Seu atacado de confiança para o varejo alimentar.
          </h1>
          <p className="text-[11px] text-emerald-100/95 mb-2">
            A Terra Lume atende supermercados, mercearias, atacarejos e varejo
            alimentar com um mix forte em giro, margem e abastecimento contínuo.
            Todo o relacionamento começa por aqui: o portal B2B oficial para lojistas.
          </p>
          <p className="text-[11px] text-emerald-100/90 mb-4">
            Acesse o catálogo, monte seu carrinho sem exibir preços, envie a
            cotação e receba as condições comerciais diretamente com nosso time
            de vendas.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/empresa/terra-lume-dist/catalogo"
              className="inline-flex items-center justify-center rounded-full px-4 py-1.5 bg-emerald-300 text-emerald-950 text-[11px] font-semibold shadow-sm hover:bg-emerald-200 transition"
            >
              Sou lojista, quero comprar agora
            </Link>
            <Link
              href="https://wa.me/5538999999999"
              target="_blank"
              className="inline-flex items-center justify-center rounded-full px-3 py-1.5 border border-emerald-200/80 text-[11px] text-emerald-50 hover:bg-emerald-800/60 transition"
            >
              Falar com o time comercial
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px]">
            <div className="rounded-xl border border-emerald-300/50 bg-emerald-900/60 px-2 py-1.5">
              <div className="font-semibold text-emerald-50">Mix em alto giro</div>
              <div className="text-emerald-100/80">
                Foco em produtos com saída constante e presença no varejo.
              </div>
            </div>
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-900/50 px-2 py-1.5">
              <div className="font-semibold text-emerald-50">Atendimento próximo</div>
              <div className="text-emerald-100/80">
                Relacionamento direto com o comercial da distribuidora.
              </div>
            </div>
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-900/50 px-2 py-1.5">
              <div className="font-semibold text-emerald-50">Portal 100% B2B</div>
              <div className="text-emerald-100/80">
                Desenvolvido para lojistas e empresas, não para consumidor final.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 space-y-3">
          <div>
            <div className="text-[12px] font-semibold text-emerald-950 mb-1">
              Ofertas em destaque por categoria
            </div>
            <p className="text-[10px] text-emerald-900/80">
              Consulte o comercial para condições especiais, ações de sell-in,
              campanhas sazonais e negociações por volume.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-sm">
              <div className="text-[11px] font-semibold text-emerald-950 mb-1">
                Mercearia seca
              </div>
              <p className="text-[10px] text-emerald-900/80 mb-1">
                Linha de itens de alto giro para gôndola, com foco em composição
                de mix e exposição.
              </p>
              <div className="text-[10px] text-emerald-700 font-medium">
                Fale com o comercial e peça a tabela atual.
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-sm">
              <div className="text-[11px] font-semibold text-emerald-950 mb-1">
                Bebidas e correlatos
              </div>
              <p className="text-[10px] text-emerald-900/80 mb-1">
                Trabalhe sazonalidade, combos e ações promocionais direto com
                nosso time.
              </p>
              <div className="text-[10px] text-emerald-700 font-medium">
                Consulte condições por volume e calendário de campanhas.
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-sm sm:col-span-2">
              <div className="text-[11px] font-semibold text-emerald-950 mb-1">
                Higiene, limpeza e apoio ao PDV
              </div>
              <p className="text-[10px] text-emerald-900/80 mb-1">
                Itens estratégicos para ticket médio, ruptura controlada e
                presença de marca nas seções de apoio.
              </p>
              <div className="text-[10px] text-emerald-700 font-medium">
                Monte sua lista de cotação direto pelo catálogo e aguarde o retorno
                da nossa equipe.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-100/70 p-3 text-[10px] text-emerald-950">
            Nenhum preço é exibido no portal. As condições comerciais são definidas
            pelo time da Terra Lume com base no seu perfil de loja, mix desejado e
            volume de compra.
          </div>
        </div>
      </section>

      {/* SEÇÃO: COMO FUNCIONA O PORTAL B2B */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[12px] font-semibold text-slate-900">
              Como funciona o portal B2B da Terra Lume
            </h2>
            <p className="text-[10px] text-slate-500">
              Em poucos passos, o lojista envia a solicitação e recebe o retorno
              do time comercial.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-5 w-5 rounded-full bg-emerald-500 text-[11px] text-white flex items-center justify-center font-semibold">
                1
              </div>
              <div className="text-[11px] font-semibold text-slate-900">
                Acesse o catálogo
              </div>
            </div>
            <p className="text-[10px] text-slate-600">
              Navegue pelo catálogo B2B, selecione os produtos de interesse e
              adicione ao carrinho. Nenhum preço é exibido nessa etapa.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-5 w-5 rounded-full bg-emerald-500 text-[11px] text-white flex items-center justify-center font-semibold">
                2
              </div>
              <div className="text-[11px] font-semibold text-slate-900">
                Envie sua cotação
              </div>
            </div>
            <p className="text-[10px] text-slate-600">
              Preencha os dados de contato e envie o pedido de cotação. A Terra
              Lume recebe o seu interesse com a lista completa dos itens.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-5 w-5 rounded-full bg-emerald-500 text-[11px] text-white flex items-center justify-center font-semibold">
                3
              </div>
              <div className="text-[11px] font-semibold text-slate-900">
                Receba o retorno do comercial
              </div>
            </div>
            <p className="text-[10px] text-slate-600">
              O time comercial analisa sua solicitação, monta a proposta com
              preços, prazos e condições, e retorna pelos canais combinados.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO: POR QUE COMPRAR COM A TERRA LUME */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
        <div>
          <h2 className="text-[12px] font-semibold text-emerald-950">
            Por que comprar com a Terra Lume Distribuidora
          </h2>
          <p className="text-[10px] text-emerald-900/80">
            A operação é pensada para o dia a dia do varejo alimentar, com foco
            em giro, abastecimento e parceria de longo prazo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-white p-3">
            <div className="text-[11px] font-semibold text-emerald-950 mb-1">
              Mix ajustado ao PDV
            </div>
            <p className="text-[10px] text-emerald-900/80">
              Produtos selecionados para aumentar a produtividade de gôndola e o
              ticket médio do seu ponto de venda.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-white p-3">
            <div className="text-[11px] font-semibold text-emerald-950 mb-1">
              Relacionamento próximo
            </div>
            <p className="text-[10px] text-emerald-900/80">
              Atendimento humano, com foco em entender o perfil de cada loja e
              construir parceria comercial contínua.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-white p-3">
            <div className="text-[11px] font-semibold text-emerald-950 mb-1">
              Portal digital para lojistas
            </div>
            <p className="text-[10px] text-emerald-900/80">
              Portal B2B moderno para organizar cotações, facilitar pedidos e
              agilizar o trabalho do comprador.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-white p-3">
            <div className="text-[11px] font-semibold text-emerald-950 mb-1">
              Foco em resultado no varejo
            </div>
            <p className="text-[10px] text-emerald-900/80">
              Toda a operação é construída para gerar giro, margem saudável e
              abastecimento consistente para o varejo.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}