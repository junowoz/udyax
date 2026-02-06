import HeaderNav from "@/components/HeaderNav";
import DemoConsoleClient from "@/components/DemoConsoleClient";

export default function DemoPage() {
  return (
    <div className="bp6-dark udy-root">
      <HeaderNav />
      <main className="udy-main">
        <section className="udy-section" aria-labelledby="demo-title">
          <header className="udy-section-header">
            <h1 id="demo-title" className="udy-section-title text-balance">
              Demo
            </h1>
            <p className="udy-section-subtitle text-pretty">
              Console operacional CityOS em tela unica: eventos sinteticos, mapa em camadas,
              decisoes e governanca em tempo real.
            </p>
          </header>
          <DemoConsoleClient />
        </section>
      </main>
    </div>
  );
}
