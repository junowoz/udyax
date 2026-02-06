"use client";

import { Card, H3, Tag } from "@blueprintjs/core";
import type { MetricItem } from "@/types/landing";

const metrics: MetricItem[] = [
  { label: "Fontes conectadas", value: "184", delta: "+12 no mês" },
  { label: "Latência média de ingestão", value: "42 ms", delta: "p95: 88 ms" },
  { label: "Eventos urbanos/min", value: "3.410", delta: "+18% após edge" },
  { label: "Camadas geográficas ativas", value: "76", delta: "13 secretarias" },
];

export default function StatusPanel() {
  return (
    <Card className="udy-status-card" elevation={1}>
      <div className="udy-status-head">
        <H3>Status Operacional</H3>
        <Tag minimal intent="warning">
          DEMO
        </Tag>
      </div>
      <div className="udy-status-grid">
        {metrics.map((item) => (
          <article key={item.label} className="udy-status-row">
            <span className="udy-status-label text-pretty">{item.label}</span>
            <span className="udy-status-value tabular-nums">{item.value}</span>
            {item.delta ? <span className="udy-status-delta">{item.delta}</span> : null}
          </article>
        ))}
      </div>
    </Card>
  );
}
