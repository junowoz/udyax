import type { IconName } from "@blueprintjs/icons";

export type SectionId = "index" | "cityos" | "fases" | "casos";

export interface NavItem {
  id: SectionId;
  label: string;
  href: string;
}

export interface MetricItem {
  label: string;
  value: string;
  delta?: string;
}

export type PhaseStatus = "Disponível" | "Em piloto" | "Roadmap";

export interface TimelinePhase {
  key: "arandu" | "akangatu" | "iande";
  roman: "I" | "II" | "III";
  title: string;
  subtitle: string;
  status: PhaseStatus;
  summary: string;
  deliverables: string[];
}

export interface ArchitectureNode {
  icon: IconName;
  title: string;
  description: string;
}

export type TimeWindow = "7d" | "30d" | "90d";

export interface UrbanSeriesPoint {
  date: string;
  value: number;
  layer?: string;
  category?: string;
}
