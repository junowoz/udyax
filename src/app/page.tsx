import HeaderNav from "@/components/HeaderNav";
import Section from "@/components/Section";
import StatusPanel from "@/components/StatusPanel";
import CityOSDefinition from "@/components/CityOSDefinition";
import ArchitectureGrid from "@/components/ArchitectureGrid";
import UrbanSignals from "@/components/UrbanSignals";

export default function Home() {
  return (
    <div className="bp6-dark udy-root">
      <HeaderNav />
      <main className="udy-main">
        <section id="manifesto" className="udy-hero" aria-labelledby="hero-title">
          <div className="udy-hero-left">
            <p className="udy-kicker">Manifesto UDYAX</p>
            <h1 id="hero-title" className="text-balance">
              Infraestrutura de dados para a cidade funcionar melhor.
            </h1>
            <p className="udy-hero-subtitle text-pretty">
              CityOS coleta, processa, consolida e distribui dados urbanos em tempo real para operação,
              planejamento e transparência institucional.
            </p>
            <ul className="udy-bullet-list">
              <li>Interoperabilidade entre sistemas legados e novos.</li>
              <li>Edge computing para baixa latência e resiliência.</li>
              <li>Governança com trilha de auditoria desde a origem.</li>
              <li>Decisão administrativa guiada por evidências.</li>
            </ul>
          </div>
          <div className="udy-hero-right">
            <StatusPanel />
          </div>
        </section>

        <Section
          id="cityos"
          title="CityOS como núcleo de dados"
          subtitle="Integração operacional, modelo urbano e distribuição confiável em uma única camada central."
        >
          <p className="udy-inline-manifest text-pretty">
            Sem um núcleo de dados, a cidade opera no escuro. Com CityOS, as secretarias deixam de
            trabalhar em silos e passam a operar sobre o mesmo contexto urbano.
          </p>
          <CityOSDefinition />
          <h3 className="udy-inline-title">Como funciona</h3>
          <ArchitectureGrid />
        </Section>

        <Section
          id="fases"
          title="3 atos do produto"
          subtitle="Conhecer. Pensar. Compartilhar."
        >
          <div className="udy-acts-grid">
            <article className="bp6-card udy-act-card">
              <p className="udy-act-roman tabular-nums">I</p>
              <h3 className="text-balance">Arandu</h3>
              <p className="text-pretty">
                Coleta e consolidação de dados urbanos em camadas de eventos, ativos e território.
              </p>
            </article>
            <article className="bp6-card udy-act-card">
              <p className="udy-act-roman tabular-nums">II</p>
              <h3 className="text-balance">Akangatu</h3>
              <p className="text-pretty">
                Simulações, previsão e otimização com gêmeo digital e análise de cenários.
              </p>
            </article>
            <article className="bp6-card udy-act-card">
              <p className="udy-act-roman tabular-nums">III</p>
              <h3 className="text-balance">Iandé</h3>
              <p className="text-pretty">
                Camadas públicas e linguagem operacional para ampliar transparência e compreensão cidadã.
              </p>
            </article>
          </div>
        </Section>

        <Section
          id="evidencias"
          title="Urban Signals"
          subtitle="Visão integrada de fontes, camadas geoespaciais e indicadores urbanos em uma sala operacional."
        >
          <UrbanSignals />
        </Section>

        <Section
          id="casos"
          title="Casos e inspiração internacional"
          subtitle="Referências de práticas públicas de dados e infraestrutura digital urbana."
        >
          <ul className="udy-cases-list">
            <li>Estônia: X-Road como referência de interoperabilidade e soberania digital estatal.</li>
            <li>Barcelona: Sentilo e abordagem de plataforma para dados urbanos em múltiplos serviços.</li>
            <li>China: centros urbanos com integração massiva de sensores, tráfego e resposta em tempo real.</li>
            <li>Singapura e Japão: disciplina operacional em planejamento urbano orientado por dados.</li>
          </ul>
        </Section>
      </main>
    </div>
  );
}
