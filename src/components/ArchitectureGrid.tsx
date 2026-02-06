"use client";

import { Card, Icon } from "@blueprintjs/core";
import { Box, Flex } from "@blueprintjs/labs";
import type { ArchitectureNode } from "@/types/landing";

const nodes: ArchitectureNode[] = [
  {
    icon: "satellite",
    title: "Conectores",
    description:
      "Integram fontes heterogêneas, com contratos de dados estáveis.",
  },
  {
    icon: "layout-grid",
    title: "Edge Nodes",
    description:
      "Processam dados localmente para reduzir latência e manter resiliência em eventos críticos.",
  },
  {
    icon: "database",
    title: "Data Fusion Engine",
    description:
      "Organiza dados por entidades, eventos e território para criar uma visão operacional única.",
  },
  {
    icon: "shield",
    title: "Governança",
    description:
      "Define quem pode ver, usar e auditar cada dado com rastreabilidade completa.",
  },
  {
    icon: "cloud-upload",
    title: "APIs Unificadas",
    description:
      "Distribuem dados padronizados para secretarias, aplicações e serviços.",
  },
  {
    icon: "panel-stats",
    title: "Apps",
    description:
      "Usados por operadores, gestores públicos e, quando aplicável, pelo cidadão.",
  },
];

export default function ArchitectureGrid() {
  return (
    <div
      className="udy-arch-grid"
      role="list"
      aria-label="Arquitetura funcional do CityOS"
    >
      {nodes.map((node) => (
        <Card
          key={node.title}
          className="udy-arch-card"
          elevation={1}
          role="listitem"
        >
          <Flex className="udy-arch-head" alignItems="center" gap={2}>
            <Icon icon={node.icon} size={18} />
            <Box asChild margin={0}>
              <h3 className="text-balance">{node.title}</h3>
            </Box>
          </Flex>
          <Box asChild margin={0}>
            <p className="text-pretty">{node.description}</p>
          </Box>
        </Card>
      ))}
    </div>
  );
}
