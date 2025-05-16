"use client";

import Image from "next/image";
import { ContextualAIChat } from "@/components/ai/contextual-ai-chat";
import { GraphPlayground } from "@/components/ai/graph-playground";
import { useState } from "react";

export default function HomePage() {
  const [currentQuery, setCurrentQuery] = useState<string | undefined>();

  return (
    <main className="flex gap-6 min-h-screen flex-col items-center bg-gradient-to-br from-[#121212] to-[#1a1a1a] px-4 py-12 text-white">
      {/* HERO + INTRO (Moved "Como funciona" here, restyled) */}
      <section className="flex flex-col w-full max-w-7xl text-center gap-4">
        <Image
          src="/logo.svg"
          alt="Udyax logo"
          width={200}
          height={55}
          className="mx-auto"
          priority
        />
        <h1 className="text-2xl font-bold leading-tight">
          Transparência governamental em tempo real.
        </h1>
        <p className="text-lg text-[#9ae69a] max-w-4xl mx-auto">
          Pergunte sobre gastos de deputados e projetos de lei. Visualize dados
          oficiais nos gráficos ao lado.
        </p>
      </section>

      {/* Chat Interface + Visualization */}
      <section id="chat" className="w-full max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full">
            <ContextualAIChat onQueryChange={setCurrentQuery} />
          </div>
          <div className="hidden md:block">
            <GraphPlayground chatQuery={currentQuery} />
          </div>
        </div>
      </section>

      {/* HOW-IT-WORKS - NEW POSITION & STYLE */}
      <section className="w-full max-w-7xl mb-8">
        <div className="bg-[#1e1e1e] rounded-xl p-6 sm:p-8 border border-[#333]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-white/90">
            Como funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
            {[
              {
                num: "1",
                title: "Pergunte",
                desc: "Envie sua dúvida em linguagem natural sobre dados governamentais.",
              },
              {
                num: "2",
                title: "Análise e Coleta",
                desc: "Buscamos e processamos dados direto das APIs públicas oficiais.",
              },
              {
                num: "3",
                title: "Visualize",
                desc: "A IA responde e gera gráficos interativos para sua análise.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="flex flex-col items-center text-center p-2"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-semibold mb-4 ring-2 ring-primary/30">
                  {step.num}
                </div>
                <h3 className="text-lg font-medium mb-2 text-white/90">
                  {step.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-400 mt-auto pt-8 pb-4">
        © {new Date().getFullYear()} Udyax · dados da{" "}
        <a
          className="underline hover:text-[#9ae69a]"
          href="https://dadosabertos.camara.leg.br"
          target="_blank"
          rel="noopener noreferrer"
        >
          Câmara dos Deputados
        </a>
      </footer>
    </main>
  );
}
