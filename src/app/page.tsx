import HeaderNav from "@/components/HeaderNav";
import Section from "@/components/Section";
import ArchitectureGrid from "@/components/ArchitectureGrid";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bp6-dark udy-root">
      <HeaderNav />
      <main className="udy-main">
        <section id="index" className="udy-hero" aria-labelledby="hero-title">
          <div className="udy-hero-left">
            <p className="udy-kicker">Index</p>
            <h1 id="hero-title" className="text-balance">
              Sistema Operacional para a Cidade
            </h1>
            <p className="udy-hero-subtitle text-pretty">
              Infraestrutura que conecta dados urbanos em tempo real para
              operação, planejamento, transparência institucional e tomada de
              decisão.
            </p>
            <ul className="udy-bullet-list">
              <li>Ingestão multi-fonte (IoT, câmeras, serviços urbanos)</li>
              <li>Visão operacional única da cidade, em tempo real</li>
              <li>
                Decisão pública com rastreabilidade: quem fez o quê, quando e
                por quê
              </li>
            </ul>
          </div>
          <div className="udy-hero-right" aria-hidden="true">
            <div className="udy-hero-image">
              <Image
                src="/hero.png"
                alt=""
                width={1024}
                height={1024}
                priority
                quality={95}
                sizes="(max-width: 1080px) 100vw, 42vw"
                className="udy-hero-img"
              />
            </div>
          </div>
        </section>

        <Section
          id="cityos"
          title="CityOS como núcleo de dados"
          subtitle="A cidade precisa de um núcleo."
        >
          <p className="udy-inline-manifest text-pretty">
            Hoje, ela opera em silos.
          </p>
          <p className="udy-inline-manifest text-pretty">
            Sem um núcleo de dados, cada secretaria enxerga apenas uma parte da
            cidade. Com o CityOS, todos operam sobre o mesmo contexto urbano, em
            tempo real.
          </p>
          <ArchitectureGrid />
        </Section>

        <Section
          id="fases"
          title="O produto em 3 atos"
          subtitle="Conhecer. Pensar. Compartilhar."
        >
          <div className="udy-acts-grid">
            <article className="bp6-card udy-act-card">
              <p className="udy-act-roman tabular-nums">I</p>
              <h3 className="text-balance">Arandu</h3>
              <p className="text-pretty">
                <strong>Conhecer a cidade como ela é.</strong>
              </p>
              <p className="text-pretty">
                Coleta e consolida dados urbanos em tempo real, organizados por:
              </p>
              <ul className="udy-bullet-list">
                <li>eventos</li>
                <li>ativos</li>
                <li>território</li>
              </ul>
              <p className="text-pretty">
                Arandu cria a base factual da operação urbana.
              </p>
            </article>
            <article className="bp6-card udy-act-card">
              <p className="udy-act-roman tabular-nums">II</p>
              <h3 className="text-balance">Akangatu</h3>
              <p className="text-pretty">
                <strong>Pensar antes de agir.</strong>
              </p>
              <p className="text-pretty">Usa dados consolidados para:</p>
              <ul className="udy-bullet-list">
                <li>simular cenários</li>
                <li>prever impactos</li>
                <li>otimizar decisões</li>
              </ul>
              <p className="text-pretty">
                Akangatu transforma dados em capacidade de planejamento e
                resposta.
              </p>
            </article>
            <article className="bp6-card udy-act-card">
              <p className="udy-act-roman tabular-nums">III</p>
              <h3 className="text-balance">Iandé</h3>
              <p className="text-pretty">
                <strong>Compartilhar contexto.</strong>
              </p>
              <p className="text-pretty">Traduz dados e decisões em:</p>
              <ul className="udy-bullet-list">
                <li>camadas públicas</li>
                <li>linguagem operacional clara</li>
                <li>transparência institucional</li>
              </ul>
              <p className="text-pretty">
                Iandé aproxima a gestão pública do cidadão.
              </p>
            </article>
          </div>
        </Section>

        <Section
          id="casos"
          title="Casos e inspiração internacional"
          subtitle="Referências de práticas públicas de dados e infraestrutura digital urbana."
        >
          <ul className="udy-cases-list">
            <li>
              Estônia: X-Road como referência de interoperabilidade e soberania
              digital estatal.
            </li>
            <li>
              Barcelona: Sentilo e abordagem de plataforma para dados urbanos em
              múltiplos serviços.
            </li>
            <li>
              China: centros urbanos com integração massiva de sensores, tráfego
              e resposta em tempo real.
            </li>
            <li>
              Singapura e Japão: disciplina operacional em planejamento urbano
              orientado por dados.
            </li>
          </ul>
        </Section>
      </main>
    </div>
  );
}
