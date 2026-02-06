"use client";

import dynamic from "next/dynamic";

const DemoConsole = dynamic(() => import("@/components/DemoConsole"), {
  ssr: false,
  loading: () => <div>Carregando DEMO...</div>,
});

export default function DemoConsoleClient() {
  return <DemoConsole />;
}
