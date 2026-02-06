"use client";

import dynamic from "next/dynamic";

const UrbanChartPanel = dynamic(() => import("@/components/charts/UrbanChartPanel"), {
  ssr: false,
  loading: () => <div className="udy-chart-loading">Carregando workspace urbano...</div>,
});

export default function UrbanSignals() {
  return <UrbanChartPanel />;
}
