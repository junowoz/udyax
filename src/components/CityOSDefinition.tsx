"use client";

import { Callout, Card } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";

const flow = [
  "Fontes",
  "Edge",
  "Data Fusion Engine",
  "Data Lake/Lakehouse",
  "APIs",
  "Apps",
];

const pillars: Array<{ title: string; icon: IconName; text: string }> = [
  { title: "Data Fusion Engine", icon: "comparison", text: "Normaliza eventos e entidades para decisões rastreáveis." },
  { title: "Digital Twin", icon: "cube", text: "Estado urbano em camadas para operação e planejamento." },
  { title: "Geo Layers", icon: "map", text: "Leitura espacial de ativos, incidentes e cobertura." },
  { title: "Audit Trails", icon: "history", text: "Origem, transformação e consumo de cada dado." },
  { title: "Unified APIs", icon: "cloud", text: "Distribuição consistente para operação, gabinete e cidadão." },
];

export default function CityOSDefinition() {
  return (
    <div className="udy-cityos-wrap">
      <div className="udy-flow" role="list" aria-label="Fluxo de dados do CityOS">
        {flow.map((step, index) => (
          <div key={step} className="udy-flow-item" role="listitem">
            <span className="udy-flow-index tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
      <div className="udy-callouts-grid">
        {pillars.map((item) => (
          <Callout key={item.title} className="udy-callout" icon={item.icon} title={item.title}>
            {item.text}
          </Callout>
        ))}
      </div>
      <Card className="udy-cityos-definition" elevation={1}>
        CityOS é a camada central de dados e interoperabilidade: ingestão, normalização, catálogos,
        governança, distribuição e observabilidade. Não é um dashboard. É infraestrutura para operar,
        simular e prestar contas com precisão.
      </Card>
    </div>
  );
}
