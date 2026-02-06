"use client";

import { Card, Icon } from "@blueprintjs/core";
import type { ArchitectureNode } from "@/types/landing";

const nodes: ArchitectureNode[] = [
  {
    icon: "satellite",
    title: "Conectores",
    description: "Integra fontes heterogêneas, legadas e novas, com contrato de dados estável.",
  },
  {
    icon: "layout-grid",
    title: "Edge Nodes",
    description: "Processamento local para latência baixa e resiliência em eventos críticos.",
  },
  {
    icon: "database",
    title: "Data Fusion Engine",
    description: "Normalização por entidades e eventos para visão operacional única.",
  },
  {
    icon: "shield",
    title: "Governança",
    description: "Catálogo, permissões e auditoria para controle institucional.",
  },
  {
    icon: "cloud-upload",
    title: "APIs Unificadas",
    description: "Distribui dados padronizados para secretarias, apps e serviços.",
  },
  {
    icon: "panel-stats",
    title: "Apps",
    description: "Consumo por operação, planejamento estratégico e interface cidadã.",
  },
];

export default function ArchitectureGrid() {
  return (
    <div className="udy-arch-grid" role="list" aria-label="Arquitetura funcional do CityOS">
      {nodes.map((node) => (
        <Card key={node.title} className="udy-arch-card" elevation={1} role="listitem">
          <div className="udy-arch-head">
            <Icon icon={node.icon} size={18} />
            <h3 className="text-balance">{node.title}</h3>
          </div>
          <p className="text-pretty">{node.description}</p>
        </Card>
      ))}
    </div>
  );
}
