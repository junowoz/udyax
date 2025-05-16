"use client";

import { Button } from "./ui/button";

export function HeroSection() {
  const scrollToChat = () => {
    const chatElement = document.getElementById("chat-section");
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            Transparência Pública em Tempo Real
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Pergunte, explore e compare promessas vs execução de prefeitos,
            vereadores, deputados e senadores — tudo em uma interface moderna.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button size="lg" onClick={scrollToChat}>
              Experimente Agora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
