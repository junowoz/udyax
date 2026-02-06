"use client";

import { Button, Card, Collapse, Tag } from "@blueprintjs/core";
import { useState } from "react";
import type { TimelinePhase } from "@/types/landing";

const phases: TimelinePhase[] = [
  {
    key: "arandu",
    roman: "I",
    title: "ARANDU (ENGINE)",
    subtitle: "Conhecer: coletar e consolidar",
    status: "Disponível",
    summary:
      "Núcleo de dados urbano com ingestão em tempo real, normalização, catálogo, governança e APIs unificadas.",
    deliverables: [
      "Conectores para IoT, câmeras/metadados, sistemas municipais e SIG",
      "Unified API Gateway",
      "Data Lake com catálogo e lineage básico",
      "Observabilidade e trilhas de auditoria",
    ],
  },
  {
    key: "akangatu",
    roman: "II",
    title: "AKANGATU (TWIN)",
    subtitle: "Pensar: simular, prever e otimizar",
    status: "Em piloto",
    summary:
      "Gêmeo digital urbano para cenários, resposta a emergências, previsões e otimização operacional orientada por evidências.",
    deliverables: [
      "Modelo 3D/2.5D opcional com geoprocessamento",
      "Simulações de tráfego, energia e incidentes",
      "Alertas preditivos e gestão de capacidade",
      "Alocação de recursos com IA responsável",
    ],
  },
  {
    key: "iande",
    roman: "III",
    title: "IANDÉ (ATLAS)",
    subtitle: "Compartilhar: transparência e interface cidadã",
    status: "Roadmap",
    summary:
      "Atlas cidadão com camadas operacionais, comunicação de incidentes e dados abertos com governança.",
    deliverables: [
      "Portal cidadão em camadas geoespaciais",
      "Status de serviços e contexto urbano em tempo real",
      "Transparência operacional com linguagem pública",
      "Open data com políticas de acesso",
    ],
  },
];

function statusIntent(status: TimelinePhase["status"]) {
  if (status === "Disponível") return "success" as const;
  if (status === "Em piloto") return "warning" as const;
  return "none" as const;
}

export default function PhaseTimeline() {
  const [open, setOpen] = useState<Record<TimelinePhase["key"], boolean>>({
    arandu: true,
    akangatu: true,
    iande: false,
  });

  return (
    <div className="udy-timeline" role="list" aria-label="Roadmap de fases do CityOS">
      {phases.map((phase) => {
        const isOpen = open[phase.key];

        return (
          <Card key={phase.key} className="udy-timeline-item" elevation={1} role="listitem">
            <div className="udy-timeline-head">
              <div className="udy-phase-mark">
                <span className="udy-phase-roman tabular-nums">{phase.roman}</span>
                <div>
                  <h3 className="text-balance">{phase.title}</h3>
                  <p className="udy-phase-subtitle text-pretty">{phase.subtitle}</p>
                </div>
              </div>
              <div className="udy-phase-controls">
                <Tag intent={statusIntent(phase.status)}>{phase.status}</Tag>
                <Button
                  small
                  icon={isOpen ? "chevron-up" : "chevron-down"}
                  text={isOpen ? "Ocultar" : "Detalhar"}
                  onClick={() => {
                    setOpen((prev) => ({ ...prev, [phase.key]: !prev[phase.key] }));
                  }}
                />
              </div>
            </div>
            <p className="udy-phase-summary text-pretty">{phase.summary}</p>
            <Collapse isOpen={isOpen} keepChildrenMounted>
              <ul className="udy-phase-list">
                {phase.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Collapse>
          </Card>
        );
      })}
    </div>
  );
}
