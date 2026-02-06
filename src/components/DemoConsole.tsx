"use client";

import {
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Dialog,
  Drawer,
  DrawerSize,
  HTMLSelect,
  HTMLTable,
  Icon,
  InputGroup,
  OverlayToaster,
  Position,
  Slider,
  Switch,
  Tab,
  Tabs,
  Tag,
  TextArea,
} from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import { Box, Flex } from "@blueprintjs/labs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Plottable from "plottable";

type ScenarioId = "normal" | "rain" | "public" | "blackout" | "operation";
type LayerId = "trafego" | "seguranca" | "energia" | "iluminacao" | "residuos" | "ar";
type Severity = "Baixa" | "Media" | "Alta" | "Critica";
type IncidentStatus = "aberto" | "mitigado" | "resolvido";
type DockTab = "eventos" | "metricas" | "decisoes" | "governanca" | "fontes";
type ModuleId = "visao" | "eventos" | "decisoes" | "governanca" | "fontes";
type TargetType = "region" | "corridor";
type InjectionKind = "incident" | "energy_spike";
type HealthState = "healthy" | "degraded" | "offline";

type Region = {
  id: string;
  name: string;
  rid: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type Corridor = {
  id: string;
  name: string;
  rid: string;
  fromRegionId: string;
  toRegionId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type Asset = {
  id: string;
  name: string;
  rid: string;
  type: string;
  regionId: string;
  corridorId: string;
  layer: LayerId;
  x: number;
  y: number;
};

type EntitySelection = {
  id: string;
  rid: string;
  label: string;
  kind: TargetType | "asset";
  layerHint?: LayerId;
  regionId?: string;
  corridorId?: string;
};

type SourceState = {
  id: string;
  name: string;
  ingestionRate: number;
  latencyMs: number;
  health: HealthState;
};

type EventRecord = {
  id: string;
  ts: number;
  timeLabel: string;
  layer: LayerId;
  entityRid: string;
  regionId?: string;
  corridorId?: string;
  severity: Severity;
  summary: string;
  source: string;
};

type IncidentRecord = {
  id: string;
  kind: InjectionKind;
  layer: LayerId;
  severity: Severity;
  status: IncidentStatus;
  summary: string;
  entityRid: string;
  regionId?: string;
  corridorId?: string;
  durationTicks: number;
  remainingTicks: number;
  openedAt: number;
};

type ActivePlaybook = {
  id: string;
  playbookId: string;
  title: string;
  layer?: LayerId;
  scope: string;
  impact: number;
  untilTick: number;
};

type AuditEntry = {
  id: string;
  timestamp: string;
  action: string;
  scope: string;
  justification: string;
  hash: string;
};

type MetricsPoint = {
  ts: number;
  eventsPerMin: number;
  selectedEventsPerMin: number;
  latencyEdgeOn: number;
  latencyEdgeOff: number;
  incidentsByLayer: Record<LayerId, number>;
  integrity: number;
};

type SimulationState = {
  events: EventRecord[];
  incidents: IncidentRecord[];
  metrics: MetricsPoint[];
  sources: SourceState[];
  auditTrail: AuditEntry[];
  activePlaybooks: ActivePlaybook[];
};

type Playbook = {
  id: string;
  title: string;
  description: string;
  layer?: LayerId;
  impact: number;
};

type EventChartPoint = {
  date: Date;
  global: number;
  selected: number;
};

type LatencyChartPoint = {
  date: Date;
  edgeOn: number;
  edgeOff: number;
};

type IncidentBarPoint = {
  layer: string;
  value: number;
};

const SCENARIO_OPTIONS: { id: ScenarioId; label: string }[] = [
  { id: "normal", label: "Dia normal" },
  { id: "rain", label: "Chuva" },
  { id: "public", label: "Evento publico" },
  { id: "blackout", label: "Apagao" },
  { id: "operation", label: "Operacao" },
];

const MODULES: { id: ModuleId; label: string; icon: IconName; tab: DockTab }[] = [
  { id: "visao", label: "Visao", icon: "dashboard", tab: "metricas" },
  { id: "eventos", label: "Eventos", icon: "timeline-events", tab: "eventos" },
  { id: "decisoes", label: "Decisoes", icon: "projects", tab: "decisoes" },
  { id: "governanca", label: "Governanca", icon: "shield", tab: "governanca" },
  { id: "fontes", label: "Fontes", icon: "database", tab: "fontes" },
];

const LAYERS: { id: LayerId; label: string }[] = [
  { id: "trafego", label: "Trafego" },
  { id: "seguranca", label: "Seguranca" },
  { id: "energia", label: "Energia" },
  { id: "iluminacao", label: "Iluminacao" },
  { id: "residuos", label: "Residuos" },
  { id: "ar", label: "Ar" },
];

const SEVERITIES: Severity[] = ["Baixa", "Media", "Alta", "Critica"];

const REGIONS: Region[] = [
  { id: "centro", name: "Centro", rid: "cityos://region/centro", x: 52, y: 58, w: 220, h: 146 },
  { id: "norte", name: "Norte", rid: "cityos://region/norte", x: 330, y: 24, w: 242, h: 130 },
  { id: "sul", name: "Sul", rid: "cityos://region/sul", x: 334, y: 202, w: 220, h: 158 },
  { id: "leste", name: "Leste", rid: "cityos://region/leste", x: 610, y: 70, w: 244, h: 214 },
];

const CORRIDORS: Corridor[] = [
  {
    id: "c-01",
    name: "Corredor C-01",
    rid: "cityos://corridor/c-01",
    fromRegionId: "centro",
    toRegionId: "norte",
    x1: 170,
    y1: 130,
    x2: 420,
    y2: 84,
  },
  {
    id: "c-02",
    name: "Corredor C-02",
    rid: "cityos://corridor/c-02",
    fromRegionId: "centro",
    toRegionId: "sul",
    x1: 194,
    y1: 164,
    x2: 420,
    y2: 282,
  },
  {
    id: "c-03",
    name: "Corredor C-03",
    rid: "cityos://corridor/c-03",
    fromRegionId: "norte",
    toRegionId: "leste",
    x1: 478,
    y1: 80,
    x2: 716,
    y2: 126,
  },
  {
    id: "c-04",
    name: "Corredor C-04",
    rid: "cityos://corridor/c-04",
    fromRegionId: "sul",
    toRegionId: "leste",
    x1: 480,
    y1: 284,
    x2: 716,
    y2: 226,
  },
];

const ASSETS: Asset[] = [
  {
    id: "s-101",
    name: "Semaforo adaptativo 101",
    rid: "cityos://asset/sensor/s-101",
    type: "sensor",
    regionId: "centro",
    corridorId: "c-01",
    layer: "trafego",
    x: 154,
    y: 122,
  },
  {
    id: "s-115",
    name: "Sensor viario 115",
    rid: "cityos://asset/sensor/s-115",
    type: "sensor",
    regionId: "centro",
    corridorId: "c-02",
    layer: "trafego",
    x: 224,
    y: 170,
  },
  {
    id: "cam-02",
    name: "Camera urbana 02",
    rid: "cityos://asset/camera/cam-02",
    type: "camera",
    regionId: "norte",
    corridorId: "c-03",
    layer: "seguranca",
    x: 412,
    y: 106,
  },
  {
    id: "sub-08",
    name: "Subestacao 08",
    rid: "cityos://asset/energia/sub-08",
    type: "energia",
    regionId: "leste",
    corridorId: "c-03",
    layer: "energia",
    x: 742,
    y: 136,
  },
  {
    id: "lum-34",
    name: "Nodo iluminacao 34",
    rid: "cityos://asset/luz/lum-34",
    type: "luz",
    regionId: "leste",
    corridorId: "c-04",
    layer: "iluminacao",
    x: 690,
    y: 246,
  },
  {
    id: "res-11",
    name: "Coleta inteligente 11",
    rid: "cityos://asset/residuos/res-11",
    type: "residuos",
    regionId: "sul",
    corridorId: "c-02",
    layer: "residuos",
    x: 392,
    y: 296,
  },
  {
    id: "ar-22",
    name: "Estacao ar 22",
    rid: "cityos://asset/ar/ar-22",
    type: "ar",
    regionId: "norte",
    corridorId: "c-01",
    layer: "ar",
    x: 476,
    y: 72,
  },
  {
    id: "s-203",
    name: "Semaforo adaptativo 203",
    rid: "cityos://asset/sensor/s-203",
    type: "sensor",
    regionId: "sul",
    corridorId: "c-04",
    layer: "trafego",
    x: 522,
    y: 292,
  },
];

const PLAYBOOKS: Playbook[] = [
  {
    id: "pb-traffic",
    title: "Sincronizar semaforos adaptativos",
    description: "Reduz variabilidade de fluxo e severidade de incidentes de trafego no escopo.",
    layer: "trafego",
    impact: 0.42,
  },
  {
    id: "pb-energy",
    title: "Despacho de manutencao eletrica",
    description: "Estabiliza eventos energeticos e acelera mitigacao de picos.",
    layer: "energia",
    impact: 0.46,
  },
  {
    id: "pb-security",
    title: "Operacao preventiva de seguranca",
    description: "Amplia cobertura de vigilancia e reduz reincidencia local.",
    layer: "seguranca",
    impact: 0.34,
  },
  {
    id: "pb-waste",
    title: "Roteiro de residuos contingente",
    description: "Prioriza corredores com backlog e reduz alertas de coleta.",
    layer: "residuos",
    impact: 0.31,
  },
];

const INITIAL_SOURCES: SourceState[] = [
  { id: "fonte-traffic", name: "Mobilidade / Semaforos", ingestionRate: 1260, latencyMs: 45, health: "healthy" },
  { id: "fonte-energy", name: "Energia / Distribuicao", ingestionRate: 780, latencyMs: 58, health: "healthy" },
  { id: "fonte-security", name: "Seguranca / Cameras", ingestionRate: 940, latencyMs: 64, health: "healthy" },
  { id: "fonte-sanitation", name: "Saneamento / Residuos", ingestionRate: 520, latencyMs: 72, health: "healthy" },
  { id: "fonte-air", name: "Meio ambiente / Qualidade do ar", ingestionRate: 340, latencyMs: 86, health: "healthy" },
];

const severityWeight: Record<Severity, number> = {
  Baixa: 0.5,
  Media: 0.95,
  Alta: 1.35,
  Critica: 1.8,
};

const scenarioVolumeFactor: Record<ScenarioId, number> = {
  normal: 1,
  rain: 1.18,
  public: 1.28,
  blackout: 1.38,
  operation: 1.1,
};

const scenarioIncidentFactor: Record<ScenarioId, number> = {
  normal: 0.08,
  rain: 0.12,
  public: 0.14,
  blackout: 0.19,
  operation: 0.1,
};

const scenarioLatencyOffset: Record<ScenarioId, number> = {
  normal: 0,
  rain: 12,
  public: 18,
  blackout: 26,
  operation: 10,
};

function createSeededRng(seed: number) {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function randomChoice<T>(items: T[], rng: () => number): T {
  const index = Math.floor(rng() * items.length);
  return items[index] ?? items[0];
}

function nowLabel(ts: number) {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour12: false });
}

function pickSeverity(rng: () => number, scenario: ScenarioId): Severity {
  const roll = rng();
  if (scenario === "blackout") {
    if (roll > 0.82) return "Critica";
    if (roll > 0.55) return "Alta";
    if (roll > 0.26) return "Media";
    return "Baixa";
  }

  if (roll > 0.91) return "Critica";
  if (roll > 0.67) return "Alta";
  if (roll > 0.34) return "Media";
  return "Baixa";
}

function pickLayer(rng: () => number, scenario: ScenarioId, activeLayers: LayerId[]): LayerId {
  const score = rng();
  if (scenario === "rain") {
    if (score < 0.3 && activeLayers.includes("trafego")) return "trafego";
    if (score < 0.52 && activeLayers.includes("energia")) return "energia";
  }
  if (scenario === "public") {
    if (score < 0.34 && activeLayers.includes("seguranca")) return "seguranca";
    if (score < 0.56 && activeLayers.includes("trafego")) return "trafego";
  }
  if (scenario === "blackout") {
    if (score < 0.52 && activeLayers.includes("energia")) return "energia";
    if (score < 0.72 && activeLayers.includes("iluminacao")) return "iluminacao";
  }

  return randomChoice(activeLayers, rng);
}

function layerLabel(layer: LayerId) {
  return LAYERS.find((item) => item.id === layer)?.label ?? layer;
}

function healthLabel(health: HealthState) {
  if (health === "healthy") return "Saudavel";
  if (health === "degraded") return "Degradado";
  return "Offline";
}

function healthIntent(health: HealthState) {
  if (health === "healthy") return "success";
  if (health === "degraded") return "warning";
  return "danger";
}

function severityIntent(severity: Severity) {
  if (severity === "Critica") return "danger";
  if (severity === "Alta") return "warning";
  if (severity === "Media") return "primary";
  return "success";
}

function incidentStatusIntent(status: IncidentStatus) {
  if (status === "aberto") return "danger";
  if (status === "mitigado") return "warning";
  return "success";
}

function scopeLabel(scope: string) {
  if (scope === "global") return "Global";
  if (scope.startsWith("region:")) {
    const region = REGIONS.find((item) => item.id === scope.replace("region:", ""));
    return region ? `Regiao ${region.name}` : scope;
  }
  if (scope.startsWith("corridor:")) {
    const corridor = CORRIDORS.find((item) => item.id === scope.replace("corridor:", ""));
    return corridor ? corridor.name : scope;
  }
  return scope;
}

function scopeMatchesIncident(scope: string, incident: IncidentRecord) {
  if (scope === "global") return true;
  if (scope.startsWith("region:")) return incident.regionId === scope.replace("region:", "");
  if (scope.startsWith("corridor:")) return incident.corridorId === scope.replace("corridor:", "");
  return false;
}

function computeIntegrity(sources: SourceState[], openIncidents: number) {
  const offline = sources.filter((source) => source.health === "offline").length;
  const degraded = sources.filter((source) => source.health === "degraded").length;
  return clamp(99.4 - offline * 17 - degraded * 7 - openIncidents * 0.65, 52, 99.8);
}

function sourceReliability(sources: SourceState[]) {
  const score = sources.reduce((acc, source) => {
    if (source.health === "healthy") return acc + 1;
    if (source.health === "degraded") return acc + 0.72;
    return acc + 0.32;
  }, 0);

  return score / sources.length;
}

function entityByRid(rid: string): EntitySelection | null {
  const region = REGIONS.find((item) => item.rid === rid);
  if (region) {
    return { id: region.id, rid: region.rid, label: region.name, kind: "region", regionId: region.id };
  }

  const corridor = CORRIDORS.find((item) => item.rid === rid);
  if (corridor) {
    return {
      id: corridor.id,
      rid: corridor.rid,
      label: corridor.name,
      kind: "corridor",
      regionId: corridor.fromRegionId,
      corridorId: corridor.id,
    };
  }

  const asset = ASSETS.find((item) => item.rid === rid);
  if (asset) {
    return {
      id: asset.id,
      rid: asset.rid,
      label: asset.name,
      kind: "asset",
      layerHint: asset.layer,
      regionId: asset.regionId,
      corridorId: asset.corridorId,
    };
  }

  return null;
}

function hashAudit(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33 + input.charCodeAt(index)) >>> 0;
  }
  return `0x${hash.toString(16).padStart(8, "0")}`;
}

function summaryForEvent(layer: LayerId, severity: Severity, entityLabel: string) {
  const prefix = `${layerLabel(layer)} ${severity.toLowerCase()}`;
  return `${prefix} em ${entityLabel}`;
}

function createEmptySimulation(): SimulationState {
  return {
    events: [],
    incidents: [],
    metrics: [],
    sources: INITIAL_SOURCES.map((source) => ({ ...source })),
    auditTrail: [],
    activePlaybooks: [],
  };
}

function renderEventsChart(container: HTMLDivElement, data: EventChartPoint[]) {
  container.innerHTML = "";
  if (data.length === 0) return () => undefined;

  const xScale = new Plottable.Scales.Time();
  const yScale = new Plottable.Scales.Linear();
  const colorScale = new Plottable.Scales.Color().domain(["Global", "Selecionado"]);

  const globalPlot = new Plottable.Plots.Line();
  globalPlot
    .addDataset(new Plottable.Dataset(data, { label: "Global" }))
    .x((d: EventChartPoint) => d.date, xScale)
    .y((d: EventChartPoint) => d.global, yScale)
    .attr("stroke", colorScale.scale("Global"))
    .attr("stroke-width", 2.2);

  const selectedPlot = new Plottable.Plots.Line();
  selectedPlot
    .addDataset(new Plottable.Dataset(data, { label: "Selecionado" }))
    .x((d: EventChartPoint) => d.date, xScale)
    .y((d: EventChartPoint) => d.selected, yScale)
    .attr("stroke", colorScale.scale("Selecionado"))
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4,3");

  const xAxis = new Plottable.Axes.Time(xScale, "bottom");
  const yAxis = new Plottable.Axes.Numeric(yScale, "left");
  const grid = new Plottable.Components.Gridlines(xScale, yScale);
  const group = new Plottable.Components.Group([grid, globalPlot, selectedPlot]);
  const legend = new Plottable.Components.Legend(colorScale);

  const table = new Plottable.Components.Table([
    [yAxis, group, legend],
    [null, xAxis, null],
  ]);

  table.renderTo(container);
  return () => table.destroy();
}

function renderLatencyChart(container: HTMLDivElement, data: LatencyChartPoint[]) {
  container.innerHTML = "";
  if (data.length === 0) return () => undefined;

  const xScale = new Plottable.Scales.Time();
  const yScale = new Plottable.Scales.Linear();
  const colorScale = new Plottable.Scales.Color().domain(["Edge ON", "Edge OFF"]);

  const edgeOnPlot = new Plottable.Plots.Line();
  edgeOnPlot
    .addDataset(new Plottable.Dataset(data, { label: "Edge ON" }))
    .x((d: LatencyChartPoint) => d.date, xScale)
    .y((d: LatencyChartPoint) => d.edgeOn, yScale)
    .attr("stroke", colorScale.scale("Edge ON"))
    .attr("stroke-width", 2.2);

  const edgeOffPlot = new Plottable.Plots.Line();
  edgeOffPlot
    .addDataset(new Plottable.Dataset(data, { label: "Edge OFF" }))
    .x((d: LatencyChartPoint) => d.date, xScale)
    .y((d: LatencyChartPoint) => d.edgeOff, yScale)
    .attr("stroke", colorScale.scale("Edge OFF"))
    .attr("stroke-width", 1.8)
    .attr("stroke-dasharray", "4,3");

  const xAxis = new Plottable.Axes.Time(xScale, "bottom");
  const yAxis = new Plottable.Axes.Numeric(yScale, "left");
  const grid = new Plottable.Components.Gridlines(xScale, yScale);
  const group = new Plottable.Components.Group([grid, edgeOnPlot, edgeOffPlot]);
  const legend = new Plottable.Components.Legend(colorScale);

  const table = new Plottable.Components.Table([
    [yAxis, group, legend],
    [null, xAxis, null],
  ]);

  table.renderTo(container);
  return () => table.destroy();
}

function renderIncidentBarChart(container: HTMLDivElement, data: IncidentBarPoint[]) {
  container.innerHTML = "";
  if (data.length === 0) return () => undefined;

  const xScale = new Plottable.Scales.Category();
  const yScale = new Plottable.Scales.Linear();
  const colorScale = new Plottable.Scales.Color().domain(data.map((item) => item.layer));

  const plot = new Plottable.Plots.Bar();
  plot
    .addDataset(new Plottable.Dataset(data))
    .x((d: IncidentBarPoint) => d.layer, xScale)
    .y((d: IncidentBarPoint) => d.value, yScale)
    .attr("fill", (d: IncidentBarPoint) => colorScale.scale(d.layer))
    .labelsEnabled(true);

  const xAxis = new Plottable.Axes.Category(xScale, "bottom");
  const yAxis = new Plottable.Axes.Numeric(yScale, "left");
  const grid = new Plottable.Components.Gridlines(null, yScale);
  const group = new Plottable.Components.Group([grid, plot]);

  const table = new Plottable.Components.Table([
    [yAxis, group],
    [null, xAxis],
  ]);

  table.renderTo(container);
  return () => table.destroy();
}

function MetricsDock({ metrics }: { metrics: MetricsPoint[] }) {
  const eventsRef = useRef<HTMLDivElement | null>(null);
  const latencyRef = useRef<HTMLDivElement | null>(null);
  const incidentsRef = useRef<HTMLDivElement | null>(null);

  const eventsData = useMemo(
    () =>
      metrics.map((item) => ({
        date: new Date(item.ts),
        global: item.eventsPerMin,
        selected: item.selectedEventsPerMin,
      })),
    [metrics],
  );

  const latencyData = useMemo(
    () =>
      metrics.map((item) => ({
        date: new Date(item.ts),
        edgeOn: item.latencyEdgeOn,
        edgeOff: item.latencyEdgeOff,
      })),
    [metrics],
  );

  const incidentsData = useMemo(() => {
    const latest = metrics.at(-1);
    if (!latest) return [];
    return LAYERS.map((layer) => ({ layer: layer.label, value: latest.incidentsByLayer[layer.id] ?? 0 }));
  }, [metrics]);

  useEffect(() => {
    if (!eventsRef.current) return undefined;
    return renderEventsChart(eventsRef.current, eventsData);
  }, [eventsData]);

  useEffect(() => {
    if (!latencyRef.current) return undefined;
    return renderLatencyChart(latencyRef.current, latencyData);
  }, [latencyData]);

  useEffect(() => {
    if (!incidentsRef.current) return undefined;
    return renderIncidentBarChart(incidentsRef.current, incidentsData);
  }, [incidentsData]);

  return (
    <div className="udy-demo-metrics-grid">
      <article className="udy-demo-dock-card">
        <header>
          <h4>Eventos/min</h4>
          <p>Global vs entidade selecionada.</p>
        </header>
        <div ref={eventsRef} className="udy-demo-chart" />
      </article>
      <article className="udy-demo-dock-card">
        <header>
          <h4>Latencia (ms)</h4>
          <p>Comparativo edge habilitado e edge desabilitado.</p>
        </header>
        <div ref={latencyRef} className="udy-demo-chart" />
      </article>
      <article className="udy-demo-dock-card">
        <header>
          <h4>Incidentes por camada</h4>
          <p>Volume ativo por dominio operacional.</p>
        </header>
        <div ref={incidentsRef} className="udy-demo-chart" />
      </article>
    </div>
  );
}

export default function DemoConsole() {
  const [activeModule, setActiveModule] = useState<ModuleId>("visao");
  const [activeDockTab, setActiveDockTab] = useState<DockTab>("metricas");
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const [scenario, setScenario] = useState<ScenarioId>("normal");
  const [ingestionIntensity, setIngestionIntensity] = useState(56);
  const [edgeEnabled, setEdgeEnabled] = useState(true);

  const [layerChecks, setLayerChecks] = useState<Record<LayerId, boolean>>({
    trafego: true,
    seguranca: true,
    energia: true,
    iluminacao: true,
    residuos: true,
    ar: true,
  });

  const [eventLayerFilters, setEventLayerFilters] = useState<Record<LayerId, boolean>>({
    trafego: true,
    seguranca: true,
    energia: true,
    iluminacao: true,
    residuos: true,
    ar: true,
  });

  const [searchRid, setSearchRid] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "Todas">("Todas");
  const [zoneFilter, setZoneFilter] = useState("todas");

  const [selectedEntity, setSelectedEntity] = useState<EntitySelection | null>(null);
  const [isEntityDrawerOpen, setEntityDrawerOpen] = useState(false);

  const [injectDialog, setInjectDialog] = useState({
    isOpen: false,
    kind: "incident" as InjectionKind,
    targetType: "region" as TargetType,
    targetId: REGIONS[0].id,
    severity: "Alta" as Severity,
    durationTicks: 8,
  });

  const [playbookDialog, setPlaybookDialog] = useState({
    isOpen: false,
    playbookId: PLAYBOOKS[0].id,
    scope: "global",
    justification: "",
    error: "",
  });

  const [isExportOpen, setExportOpen] = useState(false);
  const [isPolicyOpen, setPolicyOpen] = useState(false);

  const [simulation, setSimulation] = useState<SimulationState>(() => createEmptySimulation());

  const tickRef = useRef(0);
  const eventCounterRef = useRef(0);
  const incidentCounterRef = useRef(0);
  const auditCounterRef = useRef(0);
  const rngRef = useRef(createSeededRng(1103));
  const didPrimeRef = useRef(false);
  const toasterRef = useRef<OverlayToaster | null>(null);

  const activeLayerIds = useMemo(
    () => LAYERS.filter((layer) => layerChecks[layer.id]).map((layer) => layer.id),
    [layerChecks],
  );
  const visibleAssets = useMemo(
    () => ASSETS.filter((asset) => layerChecks[asset.layer]),
    [layerChecks],
  );

  const moduleToTab = useMemo(() => {
    return MODULES.reduce<Record<ModuleId, DockTab>>((acc, module) => {
      acc[module.id] = module.tab;
      return acc;
    }, {} as Record<ModuleId, DockTab>);
  }, []);

  const openIncidents = useMemo(
    () =>
      simulation.incidents
        .filter((incident) => incident.status !== "resolvido" && layerChecks[incident.layer])
        .slice(0, 8),
    [layerChecks, simulation.incidents],
  );

  const latestMetric = simulation.metrics.at(-1);
  const currentTick = simulation.metrics.length;

  const kpis = useMemo(() => {
    const metricTs = latestMetric?.ts ?? 0;
    const windowStart = metricTs - 60_000;
    const eventsPerMin = simulation.events.reduce((acc, event) => {
      if (event.ts < windowStart) return acc;
      if (!layerChecks[event.layer]) return acc;
      return acc + 1;
    }, 0);
    const latency = edgeEnabled
      ? (latestMetric?.latencyEdgeOn ?? 0)
      : (latestMetric?.latencyEdgeOff ?? 0);
    const incidentsOpen = simulation.incidents.filter((incident) => incident.status !== "resolvido" && layerChecks[incident.layer]).length;
    const integrity = computeIntegrity(simulation.sources, incidentsOpen);

    return {
      eventsPerMin,
      latency,
      incidentsOpen,
      integrity,
    };
  }, [edgeEnabled, layerChecks, latestMetric, simulation.events, simulation.incidents, simulation.sources]);

  const filteredEvents = useMemo(() => {
    return simulation.events.filter((event) => {
      if (searchRid && !event.entityRid.toLowerCase().includes(searchRid.toLowerCase())) return false;
      if (severityFilter !== "Todas" && event.severity !== severityFilter) return false;
      if (!eventLayerFilters[event.layer]) return false;

      if (zoneFilter !== "todas") {
        if (zoneFilter.startsWith("region:")) {
          return event.regionId === zoneFilter.replace("region:", "");
        }
        if (zoneFilter.startsWith("corridor:")) {
          return event.corridorId === zoneFilter.replace("corridor:", "");
        }
      }

      return true;
    });
  }, [eventLayerFilters, searchRid, severityFilter, simulation.events, zoneFilter]);

  const selectedEntityEvents = useMemo(() => {
    if (!selectedEntity) return [];
    return simulation.events.filter((event) => event.entityRid === selectedEntity.rid).slice(0, 6);
  }, [selectedEntity, simulation.events]);

  const suggestedPlaybooks = useMemo(() => {
    if (!selectedEntity?.layerHint) return PLAYBOOKS.slice(0, 3);
    return PLAYBOOKS.filter((playbook) => !playbook.layer || playbook.layer === selectedEntity.layerHint).slice(0, 3);
  }, [selectedEntity]);

  const showToast = useCallback((message: string, intent: "primary" | "success" | "warning" | "danger", icon: IconName) => {
    toasterRef.current?.show({ message, intent, icon, timeout: 2600 });
  }, []);

  const createEvent = useCallback(
    (
      now: number,
      layer: LayerId,
      severity: Severity,
      source: string,
      summary: string,
      target: {
        rid: string;
        regionId?: string;
        corridorId?: string;
      },
    ): EventRecord => {
      eventCounterRef.current += 1;
      return {
        id: `evt-${eventCounterRef.current.toString().padStart(6, "0")}`,
        ts: now,
        timeLabel: nowLabel(now),
        layer,
        entityRid: target.rid,
        regionId: target.regionId,
        corridorId: target.corridorId,
        severity,
        summary,
        source,
      };
    },
    [],
  );

  const createIncident = useCallback(
    (
      now: number,
      kind: InjectionKind,
      layer: LayerId,
      severity: Severity,
      summary: string,
      target: {
        rid: string;
        regionId?: string;
        corridorId?: string;
      },
      durationTicks: number,
    ): IncidentRecord => {
      incidentCounterRef.current += 1;
      return {
        id: `inc-${incidentCounterRef.current.toString().padStart(5, "0")}`,
        kind,
        layer,
        severity,
        status: "aberto",
        summary,
        entityRid: target.rid,
        regionId: target.regionId,
        corridorId: target.corridorId,
        durationTicks,
        remainingTicks: durationTicks,
        openedAt: now,
      };
    },
    [],
  );

  const resetSimulation = useCallback(() => {
    const scenarioSeed = SCENARIO_OPTIONS.findIndex((item) => item.id === scenario) + 1;
    rngRef.current = createSeededRng(1000 + scenarioSeed * 97 + ingestionIntensity * 3);
    tickRef.current = 0;
    eventCounterRef.current = 0;
    incidentCounterRef.current = 0;
    auditCounterRef.current = 0;
    setSimulation(createEmptySimulation());
    showToast("Simulacao reiniciada", "warning", "history");
  }, [ingestionIntensity, scenario, showToast]);

  const openEntityDrawer = useCallback((entity: EntitySelection) => {
    setSelectedEntity(entity);
    setEntityDrawerOpen(true);
  }, []);

  const runInjection = useCallback(
    (kind: InjectionKind, targetType: TargetType, targetId: string, severity: Severity, durationTicks: number) => {
      const target =
        targetType === "region"
          ? REGIONS.find((region) => region.id === targetId)
          : CORRIDORS.find((corridor) => corridor.id === targetId);

      if (!target) return;

      if (kind === "incident" && activeLayerIds.length === 0) {
        showToast("Ative ao menos uma camada para injetar incidente", "warning", "warning-sign");
        return;
      }

      if (kind === "energy_spike" && !layerChecks.energia) {
        showToast("Camada Energia desativada", "warning", "warning-sign");
        return;
      }

      const now = Date.now();
      const layer: LayerId =
        kind === "energy_spike"
          ? "energia"
          : randomChoice(activeLayerIds, rngRef.current);

      const source = kind === "energy_spike" ? "Energia / Distribuicao" : "Operacao manual";
      const incidentSummary =
        kind === "energy_spike"
          ? `Pico energetico manual em ${target.name}`
          : `Incidente sintetico em ${target.name}`;

      const targetEntity =
        targetType === "region"
          ? {
              rid: target.rid,
              regionId: target.id,
              corridorId: CORRIDORS.find((corridor) => corridor.fromRegionId === target.id)?.id,
            }
          : {
              rid: target.rid,
              regionId: target.fromRegionId,
              corridorId: target.id,
            };

      const newIncident = createIncident(now, kind, layer, severity, incidentSummary, targetEntity, durationTicks);
      const openEvent = createEvent(now, layer, severity, source, incidentSummary, targetEntity);

      setSimulation((prev) => ({
        ...prev,
        incidents: [newIncident, ...prev.incidents].slice(0, 200),
        events: [openEvent, ...prev.events].slice(0, 420),
      }));

      const entity = entityByRid(target.rid);
      if (entity) {
        setSelectedEntity(entity);
        setEntityDrawerOpen(true);
      }

      setActiveDockTab("eventos");
      setActiveModule("eventos");
      showToast(kind === "energy_spike" ? "Pico de energia injetado" : "Incidente injetado", "danger", "warning-sign");
    },
    [activeLayerIds, createEvent, createIncident, layerChecks.energia, showToast],
  );

  const runPlaybook = useCallback(() => {
    const playbook = PLAYBOOKS.find((item) => item.id === playbookDialog.playbookId);
    if (!playbook) return;

    const justification = playbookDialog.justification.trim();
    if (!justification) {
      setPlaybookDialog((prev) => ({ ...prev, error: "Justificativa obrigatoria." }));
      return;
    }

    const scope = playbookDialog.scope;
    const now = Date.now();
    const currentTick = tickRef.current;
    const durationTicks = 14;

    const activeRun: ActivePlaybook = {
      id: `run-${now}`,
      playbookId: playbook.id,
      title: playbook.title,
      layer: playbook.layer,
      scope,
      impact: playbook.impact,
      untilTick: currentTick + durationTicks,
    };

    auditCounterRef.current += 1;
    const actionLabel = `Executar ${playbook.title}`;
    const auditInput = `${now}-${actionLabel}-${scope}-${justification}-${auditCounterRef.current}`;
    const auditEntry: AuditEntry = {
      id: `audit-${auditCounterRef.current.toString().padStart(5, "0")}`,
      timestamp: new Date(now).toISOString(),
      action: actionLabel,
      scope: scopeLabel(scope),
      justification,
      hash: hashAudit(auditInput),
    };

    setSimulation((prev) => {
      const incidents = prev.incidents.map((incident) => {
        if (incident.status === "resolvido") return incident;
        if (playbook.layer && incident.layer !== playbook.layer) return incident;
        if (!scopeMatchesIncident(scope, incident)) return incident;

        const reducedTicks = Math.max(incident.remainingTicks - 2, 1);
        const status = reducedTicks <= Math.floor(incident.durationTicks * 0.4) ? "mitigado" : incident.status;
        return { ...incident, remainingTicks: reducedTicks, status };
      });

      return {
        ...prev,
        incidents,
        activePlaybooks: [activeRun, ...prev.activePlaybooks].slice(0, 28),
        auditTrail: [auditEntry, ...prev.auditTrail].slice(0, 260),
      };
    });

    setPlaybookDialog({
      isOpen: false,
      playbookId: playbookDialog.playbookId,
      scope,
      justification: "",
      error: "",
    });

    showToast(`Playbook aplicado: ${playbook.title}`, "success", "endorsed");
  }, [playbookDialog, showToast]);

  const setSourceHealth = useCallback(
    (sourceId: string, health: HealthState) => {
      const source = INITIAL_SOURCES.find((item) => item.id === sourceId);
      setSimulation((prev) => {
        const updatedSources = prev.sources.map((item) => {
          if (item.id !== sourceId) return item;
          return {
            ...item,
            health,
            ingestionRate: health === "offline" ? 0 : item.ingestionRate,
            latencyMs: health === "offline" ? 920 : item.latencyMs,
          };
        });

        const now = Date.now();
        const evt = createEvent(
          now,
          sourceId === "fonte-energy" ? "energia" : "seguranca",
          health === "offline" ? "Alta" : "Media",
          source?.name ?? "Fonte",
          health === "offline" ? `Falha simulada em ${source?.name}` : `Fonte restaurada: ${source?.name}`,
          {
            rid: REGIONS[0].rid,
            regionId: REGIONS[0].id,
          },
        );

        return {
          ...prev,
          sources: updatedSources,
          events: [evt, ...prev.events].slice(0, 420),
        };
      });

      showToast(
        health === "offline" ? "Falha de fonte simulada" : "Fonte restaurada",
        health === "offline" ? "danger" : "success",
        health === "offline" ? "offline" : "tick",
      );
    },
    [createEvent, showToast],
  );

  const advanceSimulation = useCallback(() => {
    setSimulation((prev) => {
      const now = Date.now();
      const rng = rngRef.current;
      const tick = tickRef.current + 1;
      tickRef.current = tick;

      const layers = activeLayerIds;
      const reliability = sourceReliability(prev.sources);

      const activePlaybooks = prev.activePlaybooks.filter((run) => run.untilTick > tick);
      const playbookShield = activePlaybooks.reduce((acc, run) => acc + run.impact * 0.2, 0);

      const transitionedEvents: EventRecord[] = [];
      const incidents = prev.incidents.map((incident) => {
        if (incident.status === "resolvido") return incident;

        const scopedImpact = activePlaybooks.reduce((acc, run) => {
          if (run.layer && run.layer !== incident.layer) return acc;
          if (!scopeMatchesIncident(run.scope, incident)) return acc;
          return acc + run.impact;
        }, 0);

        const oldStatus = incident.status;
        const mitigationDelta = Math.round(scopedImpact * 2);
        const remainingTicks = incident.remainingTicks - 1 - mitigationDelta;

        let nextStatus: IncidentStatus = oldStatus;
        let nextRemaining = remainingTicks;

        if (remainingTicks <= 0) {
          nextStatus = "resolvido";
          nextRemaining = 0;
        } else if (remainingTicks <= Math.floor(incident.durationTicks * 0.45) && oldStatus === "aberto") {
          nextStatus = "mitigado";
        }

        if (nextStatus !== oldStatus) {
          transitionedEvents.push(
            createEvent(
              now,
              incident.layer,
              nextStatus === "resolvido" ? "Baixa" : "Media",
              "Motor de simulacao",
              `${incident.summary} (${nextStatus})`,
              {
                rid: incident.entityRid,
                regionId: incident.regionId,
                corridorId: incident.corridorId,
              },
            ),
          );
        }

        return {
          ...incident,
          status: nextStatus,
          remainingTicks: nextRemaining,
        };
      });

      const autoIncidentChance = clamp(
        scenarioIncidentFactor[scenario] * (ingestionIntensity / 100) * (2.08 - reliability) - playbookShield,
        0.02,
        0.48,
      );

      const generatedIncidents: IncidentRecord[] = [];
      const generatedEvents: EventRecord[] = [];

      if (layers.length > 0 && rng() < autoIncidentChance) {
        const targetType: TargetType = rng() > 0.56 ? "corridor" : "region";
        const target = targetType === "region" ? randomChoice(REGIONS, rng) : randomChoice(CORRIDORS, rng);
        const severity = pickSeverity(rng, scenario);
        const layer = pickLayer(rng, scenario, layers);

        const targetEntity =
          targetType === "region"
            ? {
                rid: target.rid,
                regionId: target.id,
                corridorId: CORRIDORS.find((corridor) => corridor.fromRegionId === target.id)?.id,
              }
            : {
                rid: target.rid,
                regionId: target.fromRegionId,
                corridorId: target.id,
              };

        const incidentSummary = `Alerta sintetico em ${target.name}`;
        const incident = createIncident(now, "incident", layer, severity, incidentSummary, targetEntity, 9);
        generatedIncidents.push(incident);

        generatedEvents.push(
          createEvent(now, layer, severity, "Motor de simulacao", incidentSummary, targetEntity),
        );
      }

      const volume =
        layers.length === 0
          ? 0
          : clamp(
              Math.round((ingestionIntensity / 17) * scenarioVolumeFactor[scenario] * reliability * (1 - playbookShield)),
              1,
              18,
            );

      const onlineSources = prev.sources.filter((source) => source.health !== "offline");
      const eventSources = onlineSources.length > 0 ? onlineSources : prev.sources;

      for (let index = 0; index < volume; index += 1) {
        const layer = pickLayer(rng, scenario, layers);
        const severity = pickSeverity(rng, scenario);

        const entityRoll = rng();
        let target: { rid: string; label: string; regionId?: string; corridorId?: string; layer: LayerId };

        if (entityRoll < 0.62) {
          const assets = ASSETS.filter((asset) => layers.includes(asset.layer));
          const asset = assets.length > 0 ? randomChoice(assets, rng) : randomChoice(ASSETS, rng);
          target = {
            rid: asset.rid,
            label: asset.name,
            regionId: asset.regionId,
            corridorId: asset.corridorId,
            layer: asset.layer,
          };
        } else if (entityRoll < 0.86) {
          const corridor = randomChoice(CORRIDORS, rng);
          target = {
            rid: corridor.rid,
            label: corridor.name,
            regionId: corridor.fromRegionId,
            corridorId: corridor.id,
            layer,
          };
        } else {
          const region = randomChoice(REGIONS, rng);
          target = {
            rid: region.rid,
            label: region.name,
            regionId: region.id,
            corridorId: CORRIDORS.find((corridor) => corridor.fromRegionId === region.id)?.id,
            layer,
          };
        }

        const source = randomChoice(eventSources, rng);
        const adjustedSeverity = severityWeight[severity] > 1.5 && source.health === "degraded" ? "Alta" : severity;

        generatedEvents.push(
          createEvent(
            now,
            target.layer,
            adjustedSeverity,
            source.name,
            summaryForEvent(target.layer, adjustedSeverity, target.label),
            {
              rid: target.rid,
              regionId: target.regionId,
              corridorId: target.corridorId,
            },
          ),
        );
      }

      const sources = prev.sources.map((source) => {
        const baseline = INITIAL_SOURCES.find((item) => item.id === source.id) ?? source;

        if (source.health === "offline") {
          return {
            ...source,
            ingestionRate: 0,
            latencyMs: 880 + Math.round(rng() * 120),
          };
        }

        const jitter = 0.9 + rng() * 0.2;

        if (source.health === "degraded") {
          return {
            ...source,
            ingestionRate: Math.round(baseline.ingestionRate * 0.58 * jitter),
            latencyMs: Math.round((baseline.latencyMs + 64) * jitter),
          };
        }

        return {
          ...source,
          ingestionRate: Math.round(baseline.ingestionRate * jitter),
          latencyMs: Math.round(baseline.latencyMs * jitter),
        };
      });

      const incidentsMerged = [
        ...generatedIncidents,
        ...incidents,
      ].slice(0, 220);

      const eventsMerged = [
        ...generatedEvents,
        ...transitionedEvents,
        ...prev.events,
      ].slice(0, 420);

      const windowStart = now - 60_000;
      const eventsPerMin = eventsMerged.reduce((acc, event) => (event.ts >= windowStart ? acc + 1 : acc), 0);
      const selectedEventsPerMin = selectedEntity
        ? eventsMerged.reduce(
            (acc, event) => (event.ts >= windowStart && event.entityRid === selectedEntity.rid ? acc + 1 : acc),
            0,
          )
        : 0;

      const activeIncidents = incidentsMerged.filter((incident) => incident.status !== "resolvido");
      const incidentCountByLayer = LAYERS.reduce<Record<LayerId, number>>((acc, layer) => {
        acc[layer.id] = activeIncidents.filter((incident) => incident.layer === layer.id).length;
        return acc;
      }, {} as Record<LayerId, number>);

      const offlineCount = sources.filter((source) => source.health === "offline").length;
      const degradedCount = sources.filter((source) => source.health === "degraded").length;

      const edgeOnLatency = Math.round(
        clamp(
          42 + scenarioLatencyOffset[scenario] + degradedCount * 25 + offlineCount * 82 + (rng() * 12 - 6),
          24,
          1550,
        ),
      );

      const edgeOffLatency = edgeOnLatency + 36 + Math.round(rng() * 14);

      const metric: MetricsPoint = {
        ts: now,
        eventsPerMin,
        selectedEventsPerMin,
        latencyEdgeOn: edgeOnLatency,
        latencyEdgeOff: edgeOffLatency,
        incidentsByLayer: incidentCountByLayer,
        integrity: computeIntegrity(sources, activeIncidents.length),
      };

      return {
        ...prev,
        sources,
        events: eventsMerged,
        incidents: incidentsMerged,
        metrics: [...prev.metrics, metric].slice(-72),
        activePlaybooks,
      };
    });
  }, [activeLayerIds, createEvent, createIncident, ingestionIntensity, scenario, selectedEntity]);

  useEffect(() => {
    if (didPrimeRef.current) return;
    didPrimeRef.current = true;
    advanceSimulation();
    advanceSimulation();
    advanceSimulation();
  }, [advanceSimulation]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      advanceSimulation();
    }, 1200);

    return () => {
      window.clearInterval(timer);
    };
  }, [advanceSimulation]);

  const handleModuleClick = useCallback(
    (moduleId: ModuleId) => {
      setActiveModule(moduleId);
      setActiveDockTab(moduleToTab[moduleId]);
    },
    [moduleToTab],
  );

  const handleSelectZone = useCallback((value: string) => {
    setZoneFilter(value);
  }, []);

  const entityStateLabel = useMemo(() => {
    if (!selectedEntity) return "Nao selecionado";
    const related = simulation.incidents.filter((incident) => {
      if (incident.entityRid === selectedEntity.rid) return true;
      if (selectedEntity.kind === "region") return incident.regionId === selectedEntity.regionId;
      if (selectedEntity.kind === "corridor") return incident.corridorId === selectedEntity.corridorId;
      return false;
    });

    if (related.some((item) => item.status === "aberto")) return "Critico";
    if (related.some((item) => item.status === "mitigado")) return "Mitigando";
    return "Monitorado";
  }, [selectedEntity, simulation.incidents]);

  return (
    <div className="udy-demo-root">
      <div className="udy-demo-shell bp6-dark">
        <aside className="udy-demo-sidebar" aria-label="Modulos do console">
          {MODULES.map((module) => (
            <button
              key={module.id}
              type="button"
              className={`udy-demo-module-btn ${activeModule === module.id ? "is-active" : ""}`}
              onClick={() => handleModuleClick(module.id)}
            >
              <Icon icon={module.icon} size={16} />
              <span>{module.label}</span>
            </button>
          ))}
        </aside>

        <section className="udy-demo-center">
          <Card className="udy-demo-controlbar" elevation={0}>
            <div className="udy-demo-control-grid">
              <label className="udy-demo-control-block">
                <span>Cenario</span>
                <HTMLSelect
                  fill
                  value={scenario}
                  onChange={(event) => setScenario(event.target.value as ScenarioId)}
                  options={SCENARIO_OPTIONS.map((item) => ({ value: item.id, label: item.label }))}
                />
              </label>

              <div className="udy-demo-control-block">
                <span>Intensidade de ingestao: {ingestionIntensity}</span>
                <Slider
                  min={20}
                  max={100}
                  stepSize={4}
                  labelStepSize={20}
                  value={ingestionIntensity}
                  onChange={setIngestionIntensity}
                />
              </div>

              <label className="udy-demo-control-switch">
                <span>Edge habilitado</span>
                <Switch
                  checked={edgeEnabled}
                  onChange={(event) => setEdgeEnabled((event.target as HTMLInputElement).checked)}
                  innerLabel="OFF"
                  innerLabelChecked="ON"
                  large
                />
              </label>
            </div>

            <ButtonGroup minimal={false} className="udy-demo-control-actions">
              <Button
                icon="warning-sign"
                intent="warning"
                text="Injetar incidente"
                onClick={() =>
                  setInjectDialog({
                    isOpen: true,
                    kind: "incident",
                    targetType: "region",
                    targetId: REGIONS[0].id,
                    severity: "Alta",
                    durationTicks: 8,
                  })
                }
              />
              <Button
                icon="flash"
                intent="danger"
                text="Injetar pico de energia"
                onClick={() =>
                  setInjectDialog({
                    isOpen: true,
                    kind: "energy_spike",
                    targetType: "corridor",
                    targetId: CORRIDORS[0].id,
                    severity: "Critica",
                    durationTicks: 10,
                  })
                }
              />
              <Button icon="reset" text="Reset" onClick={resetSimulation} />
            </ButtonGroup>
          </Card>

          <Card className="udy-demo-map-card" elevation={0}>
            <header className="udy-demo-map-head">
              <div>
                <h3>Mapa urbano em camadas</h3>
                <p>Selecione regiao, corredor ou ativo para abrir detalhes operacionais.</p>
              </div>
              <Tag intent="primary" minimal={false} className="tabular-nums">
                Tick {currentTick}
              </Tag>
            </header>

            <div className="udy-demo-map-wrap" role="img" aria-label="Mapa geoespacial operacional">
              <svg viewBox="0 0 920 380" className="udy-demo-map-svg">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(72,175,240,0.12)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="920" height="380" fill="url(#grid)" />

                {CORRIDORS.map((corridor) => {
                  const selected = selectedEntity?.rid === corridor.rid;
                  return (
                    <g key={corridor.id}>
                      <line
                        x1={corridor.x1}
                        y1={corridor.y1}
                        x2={corridor.x2}
                        y2={corridor.y2}
                        stroke={selected ? "#f29d49" : "#5c7080"}
                        strokeWidth={selected ? 7 : 5}
                        strokeLinecap="round"
                        className="udy-demo-map-corridor"
                        onClick={() =>
                          openEntityDrawer({
                            id: corridor.id,
                            rid: corridor.rid,
                            label: corridor.name,
                            kind: "corridor",
                            regionId: corridor.fromRegionId,
                            corridorId: corridor.id,
                          })
                        }
                      />
                      <text x={(corridor.x1 + corridor.x2) / 2} y={(corridor.y1 + corridor.y2) / 2 - 8}>
                        {corridor.id.toUpperCase()}
                      </text>
                    </g>
                  );
                })}

                {REGIONS.map((region) => {
                  const selected = selectedEntity?.rid === region.rid;
                  return (
                    <g key={region.id}>
                      <rect
                        x={region.x}
                        y={region.y}
                        width={region.w}
                        height={region.h}
                        rx={8}
                        className={`udy-demo-map-region ${selected ? "is-selected" : ""}`}
                        onClick={() =>
                          openEntityDrawer({
                            id: region.id,
                            rid: region.rid,
                            label: region.name,
                            kind: "region",
                            regionId: region.id,
                          })
                        }
                      />
                      <text x={region.x + 12} y={region.y + 22}>
                        {region.name}
                      </text>
                    </g>
                  );
                })}

                {visibleAssets.map((asset) => {
                  const selected = selectedEntity?.rid === asset.rid;
                  return (
                    <g key={asset.id}>
                      <circle
                        cx={asset.x}
                        cy={asset.y}
                        r={selected ? 9 : 7}
                        className={`udy-demo-map-asset ${selected ? "is-selected" : ""}`}
                        onClick={() =>
                          openEntityDrawer({
                            id: asset.id,
                            rid: asset.rid,
                            label: asset.name,
                            kind: "asset",
                            layerHint: asset.layer,
                            regionId: asset.regionId,
                            corridorId: asset.corridorId,
                          })
                        }
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </Card>

          <Card className={`udy-demo-dock ${dockCollapsed ? "is-collapsed" : ""}`} elevation={0}>
            <header className="udy-demo-dock-head">
              <div>
                <h3>Painel operacional</h3>
                <p>Eventos, metricas, decisoes, governanca e fontes sem trocar de tela.</p>
              </div>
              <Button
                small
                icon={dockCollapsed ? "chevron-up" : "chevron-down"}
                text={dockCollapsed ? "Expandir" : "Recolher"}
                onClick={() => setDockCollapsed((prev) => !prev)}
              />
            </header>

            {!dockCollapsed ? (
              <Tabs
                id="udy-demo-dock-tabs"
                selectedTabId={activeDockTab}
                onChange={(tabId) => setActiveDockTab(tabId as DockTab)}
                renderActiveTabPanelOnly
              >
                <Tab
                  id="eventos"
                  title="Eventos"
                  panel={
                    <div className="udy-demo-events-tab">
                      <div className="udy-demo-filter-grid">
                        <InputGroup
                          placeholder="Buscar rid"
                          value={searchRid}
                          onChange={(event) => setSearchRid(event.target.value)}
                          leftIcon="search"
                        />

                        <HTMLSelect
                          value={severityFilter}
                          onChange={(event) => setSeverityFilter(event.target.value as Severity | "Todas")}
                          options={["Todas", ...SEVERITIES]}
                        />

                        <HTMLSelect
                          value={zoneFilter}
                          onChange={(event) => handleSelectZone(event.target.value)}
                          options={[
                            { value: "todas", label: "Todas regioes/corredores" },
                            ...REGIONS.map((region) => ({ value: `region:${region.id}`, label: `Regiao ${region.name}` })),
                            ...CORRIDORS.map((corridor) => ({
                              value: `corridor:${corridor.id}`,
                              label: corridor.name,
                            })),
                          ]}
                        />

                        <div className="udy-demo-layer-filter">
                          {LAYERS.map((layer) => (
                            <Checkbox
                              key={layer.id}
                              checked={eventLayerFilters[layer.id]}
                              label={layer.label}
                              onChange={(event) => {
                                const checked = (event.target as HTMLInputElement).checked;
                                setEventLayerFilters((prev) => ({ ...prev, [layer.id]: checked }));
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="udy-demo-table-wrap">
                        <HTMLTable bordered interactive condensed striped className="udy-demo-table">
                          <thead>
                            <tr>
                              <th>Hora</th>
                              <th>Camada</th>
                              <th>Entidade</th>
                              <th>Regiao/Corredor</th>
                              <th>Severidade</th>
                              <th>Resumo</th>
                              <th>Fonte</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEvents.slice(0, 80).map((event) => {
                              const region = event.regionId
                                ? REGIONS.find((item) => item.id === event.regionId)?.name
                                : "-";
                              const corridor = event.corridorId
                                ? CORRIDORS.find((item) => item.id === event.corridorId)?.id.toUpperCase()
                                : "-";

                              return (
                                <tr
                                  key={event.id}
                                  onClick={() => {
                                    const entity = entityByRid(event.entityRid);
                                    if (entity) {
                                      openEntityDrawer(entity);
                                    }
                                  }}
                                >
                                  <td className="tabular-nums">{event.timeLabel}</td>
                                  <td>{layerLabel(event.layer)}</td>
                                  <td className="udy-cell-truncate">{event.entityRid}</td>
                                  <td>{`${region} / ${corridor}`}</td>
                                  <td>
                                    <Tag minimal intent={severityIntent(event.severity)}>
                                      {event.severity}
                                    </Tag>
                                  </td>
                                  <td className="udy-cell-truncate">{event.summary}</td>
                                  <td>{event.source}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </HTMLTable>
                      </div>
                    </div>
                  }
                />

                <Tab id="metricas" title="Metricas" panel={<MetricsDock metrics={simulation.metrics} />} />

                <Tab
                  id="decisoes"
                  title="Decisoes"
                  panel={
                    <div className="udy-demo-playbook-grid">
                      {PLAYBOOKS.map((playbook) => (
                        <article key={playbook.id} className="udy-demo-playbook-card">
                          <header>
                            <h4>{playbook.title}</h4>
                            <Tag intent="primary" minimal>
                              Impacto {Math.round(playbook.impact * 100)}%
                            </Tag>
                          </header>
                          <p>{playbook.description}</p>
                          <footer>
                            <Button
                              small
                              intent="success"
                              icon="play"
                              text="Executar"
                              onClick={() =>
                                setPlaybookDialog({
                                  isOpen: true,
                                  playbookId: playbook.id,
                                  scope: "global",
                                  justification: "",
                                  error: "",
                                })
                              }
                            />
                          </footer>
                        </article>
                      ))}
                    </div>
                  }
                />

                <Tab
                  id="governanca"
                  title="Governanca"
                  panel={
                    <div className="udy-demo-governance">
                      <div className="udy-demo-governance-actions">
                        <Button icon="export" text="Exportar JSON" onClick={() => setExportOpen(true)} />
                        <Button icon="lock" text="Ver politica de acesso" onClick={() => setPolicyOpen(true)} />
                      </div>

                      <div className="udy-demo-table-wrap">
                        <HTMLTable bordered striped condensed className="udy-demo-table">
                          <thead>
                            <tr>
                              <th>Timestamp</th>
                              <th>Acao</th>
                              <th>Escopo</th>
                              <th>Justificativa</th>
                              <th>Integridade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {simulation.auditTrail.slice(0, 120).map((entry) => (
                              <tr key={entry.id}>
                                <td className="tabular-nums">{new Date(entry.timestamp).toLocaleString("pt-BR")}</td>
                                <td>{entry.action}</td>
                                <td>{entry.scope}</td>
                                <td className="udy-cell-truncate">{entry.justification}</td>
                                <td className="tabular-nums">{entry.hash}</td>
                              </tr>
                            ))}
                          </tbody>
                        </HTMLTable>
                      </div>
                    </div>
                  }
                />

                <Tab
                  id="fontes"
                  title="Fontes"
                  panel={
                    <div className="udy-demo-sources">
                      {simulation.sources.map((source) => (
                        <article key={source.id} className="udy-demo-source-card">
                          <div>
                            <h4>{source.name}</h4>
                            <p>
                              Ingestao: <strong className="tabular-nums">{source.ingestionRate}</strong>/min | Latencia:
                              <strong className="tabular-nums"> {source.latencyMs} ms</strong>
                            </p>
                          </div>
                          <div className="udy-demo-source-actions">
                            <Tag intent={healthIntent(source.health)}>{healthLabel(source.health)}</Tag>
                            <Button
                              small
                              icon="offline"
                              intent="danger"
                              text="Simular falha"
                              disabled={source.health === "offline"}
                              onClick={() => setSourceHealth(source.id, "offline")}
                            />
                            <Button
                              small
                              icon="refresh"
                              intent="success"
                              text="Restaurar"
                              disabled={source.health === "healthy"}
                              onClick={() => setSourceHealth(source.id, "healthy")}
                            />
                          </div>
                        </article>
                      ))}
                    </div>
                  }
                />
              </Tabs>
            ) : null}
          </Card>
        </section>

        <aside className="udy-demo-rail">
          <Card className="udy-demo-rail-card" elevation={0}>
            <Box asChild marginBottom={2}>
              <header>
                <h4>Camadas ativas</h4>
              </header>
            </Box>
            <Box className="udy-demo-layer-list" display="grid" gap={2}>
              {LAYERS.map((layer) => (
                <Checkbox
                  key={layer.id}
                  checked={layerChecks[layer.id]}
                  label={layer.label}
                  onChange={(event) => {
                    const checked = (event.target as HTMLInputElement).checked;
                    setLayerChecks((prev) => ({ ...prev, [layer.id]: checked }));
                    setEventLayerFilters((prev) => ({ ...prev, [layer.id]: checked }));
                  }}
                />
              ))}
            </Box>
          </Card>

          <Card className="udy-demo-rail-card" elevation={0}>
            <Box asChild marginBottom={2}>
              <header>
                <h4>KPIs em tempo real</h4>
              </header>
            </Box>
            <div className="udy-demo-kpi-grid">
              <article>
                <span>Eventos/min</span>
                <strong className="tabular-nums">{kpis.eventsPerMin}</strong>
              </article>
              <article>
                <span>Latencia</span>
                <strong className="tabular-nums">{kpis.latency} ms</strong>
              </article>
              <article>
                <span>Incidentes abertos</span>
                <strong className="tabular-nums">{kpis.incidentsOpen}</strong>
              </article>
              <article>
                <span>Integridade</span>
                <strong className="tabular-nums">{kpis.integrity.toFixed(1)}%</strong>
              </article>
            </div>
          </Card>

          <Card className="udy-demo-rail-card" elevation={0}>
            <Box asChild marginBottom={2}>
              <header>
                <h4>Incidentes ativos</h4>
              </header>
            </Box>
            <ul className="udy-demo-incident-list">
              {openIncidents.map((incident) => (
                <li key={incident.id}>
                  <Flex flexDirection="column" gap={1} width="100%" style={{ minWidth: 0 }}>
                    <p>{incident.summary}</p>
                    <small>{incident.entityRid}</small>
                  </Flex>
                  <Tag minimal intent={incidentStatusIntent(incident.status)}>
                    {incident.status}
                  </Tag>
                </li>
              ))}
              {openIncidents.length === 0 ? (
                <li>
                  <small>Nenhum incidente ativo nas camadas selecionadas.</small>
                </li>
              ) : null}
            </ul>
          </Card>

          <Card className="udy-demo-rail-card" elevation={0}>
            <Box asChild marginBottom={2}>
              <header>
                <h4>Acoes rapidas</h4>
              </header>
            </Box>
            <Flex className="udy-demo-quick-actions" flexDirection="column" gap={2}>
              <Button
                fill
                alignText="left"
                icon="warning-sign"
                text="Abrir incidente"
                onClick={() =>
                  setInjectDialog({
                    isOpen: true,
                    kind: "incident",
                    targetType: "region",
                    targetId: REGIONS[1].id,
                    severity: "Alta",
                    durationTicks: 8,
                  })
                }
              />
              <Button
                fill
                alignText="left"
                icon="send-message"
                text="Executar playbook"
                onClick={() =>
                  setPlaybookDialog({
                    isOpen: true,
                    playbookId: PLAYBOOKS[0].id,
                    scope: "global",
                    justification: "",
                    error: "",
                  })
                }
              />
              <Button
                fill
                alignText="left"
                icon="refresh"
                text="Sincronizar fontes"
                onClick={() => showToast("Fontes sincronizadas", "primary", "refresh")}
              />
            </Flex>
          </Card>
        </aside>
      </div>

      <Drawer
        className="udy-demo-overlay"
        icon="search-template"
        title={selectedEntity ? `Detalhes da entidade - ${selectedEntity.label}` : "Detalhes da entidade"}
        isOpen={isEntityDrawerOpen}
        onClose={() => setEntityDrawerOpen(false)}
        position={Position.RIGHT}
        size={DrawerSize.SMALL}
      >
        {selectedEntity ? (
          <div className="udy-demo-entity-drawer">
            <article>
              <h4>RID</h4>
              <p className="udy-cell-truncate">{selectedEntity.rid}</p>
            </article>

            <article>
              <h4>Status</h4>
              <Tag intent={entityStateLabel === "Critico" ? "danger" : entityStateLabel === "Mitigando" ? "warning" : "success"}>
                {entityStateLabel}
              </Tag>
            </article>

            <article>
              <h4>Ultimos eventos</h4>
              <ul>
                {selectedEntityEvents.length > 0 ? (
                  selectedEntityEvents.map((event) => (
                    <li key={event.id}>
                      <small className="tabular-nums">{event.timeLabel}</small>
                      <span>{event.summary}</span>
                    </li>
                  ))
                ) : (
                  <li>
                    <span>Sem eventos recentes para a entidade.</span>
                  </li>
                )}
              </ul>
            </article>

            <article>
              <h4>Acoes sugeridas</h4>
              <div className="udy-demo-drawer-actions">
                {suggestedPlaybooks.map((playbook) => (
                  <Button
                    key={playbook.id}
                    small
                    icon="play"
                    text={playbook.title}
                    onClick={() =>
                      setPlaybookDialog({
                        isOpen: true,
                        playbookId: playbook.id,
                        scope: selectedEntity.kind === "region" ? `region:${selectedEntity.id}` : "global",
                        justification: "",
                        error: "",
                      })
                    }
                  />
                ))}
              </div>
            </article>
          </div>
        ) : null}
      </Drawer>

      <Dialog
        className="udy-demo-overlay"
        title={injectDialog.kind === "energy_spike" ? "Injetar pico de energia" : "Injetar incidente"}
        isOpen={injectDialog.isOpen}
        onClose={() => setInjectDialog((prev) => ({ ...prev, isOpen: false }))}
      >
        <div className="bp6-dialog-body udy-demo-dialog-body">
          <label>
            <span>Escopo</span>
            <HTMLSelect
              fill
              value={injectDialog.targetType}
              onChange={(event) => {
                const targetType = event.target.value as TargetType;
                setInjectDialog((prev) => ({
                  ...prev,
                  targetType,
                  targetId: targetType === "region" ? REGIONS[0].id : CORRIDORS[0].id,
                }));
              }}
              options={[
                { value: "region", label: "Regiao" },
                { value: "corridor", label: "Corredor" },
              ]}
            />
          </label>

          <label>
            <span>Regiao/Corredor</span>
            <HTMLSelect
              fill
              value={injectDialog.targetId}
              onChange={(event) => setInjectDialog((prev) => ({ ...prev, targetId: event.target.value }))}
              options={
                injectDialog.targetType === "region"
                  ? REGIONS.map((region) => ({ value: region.id, label: region.name }))
                  : CORRIDORS.map((corridor) => ({ value: corridor.id, label: corridor.name }))
              }
            />
          </label>

          <label>
            <span>Severidade</span>
            <HTMLSelect
              fill
              value={injectDialog.severity}
              onChange={(event) => setInjectDialog((prev) => ({ ...prev, severity: event.target.value as Severity }))}
              options={SEVERITIES}
            />
          </label>

          <label>
            <span>Duracao (ticks): {injectDialog.durationTicks}</span>
            <Slider
              min={3}
              max={16}
              stepSize={1}
              labelStepSize={4}
              value={injectDialog.durationTicks}
              onChange={(value) => setInjectDialog((prev) => ({ ...prev, durationTicks: value }))}
            />
          </label>
        </div>
        <div className="bp6-dialog-footer">
          <div className="bp6-dialog-footer-actions">
            <Button text="Cancelar" onClick={() => setInjectDialog((prev) => ({ ...prev, isOpen: false }))} />
            <Button
              intent="primary"
              text="Injetar"
              onClick={() => {
                runInjection(
                  injectDialog.kind,
                  injectDialog.targetType,
                  injectDialog.targetId,
                  injectDialog.severity,
                  injectDialog.durationTicks,
                );
                setInjectDialog((prev) => ({ ...prev, isOpen: false }));
              }}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        className="udy-demo-overlay"
        title="Executar playbook"
        isOpen={playbookDialog.isOpen}
        onClose={() => setPlaybookDialog((prev) => ({ ...prev, isOpen: false, error: "" }))}
      >
        <div className="bp6-dialog-body udy-demo-dialog-body">
          <label>
            <span>Playbook</span>
            <HTMLSelect
              fill
              value={playbookDialog.playbookId}
              onChange={(event) =>
                setPlaybookDialog((prev) => ({
                  ...prev,
                  playbookId: event.target.value,
                  error: "",
                }))
              }
              options={PLAYBOOKS.map((playbook) => ({ value: playbook.id, label: playbook.title }))}
            />
          </label>

          <label>
            <span>Escopo</span>
            <HTMLSelect
              fill
              value={playbookDialog.scope}
              onChange={(event) => setPlaybookDialog((prev) => ({ ...prev, scope: event.target.value }))}
              options={[
                { value: "global", label: "Global" },
                ...REGIONS.map((region) => ({ value: `region:${region.id}`, label: `Regiao ${region.name}` })),
                ...CORRIDORS.map((corridor) => ({ value: `corridor:${corridor.id}`, label: corridor.name })),
              ]}
            />
          </label>

          <label>
            <span>Justificativa</span>
            <TextArea
              fill
              growVertically
              large
              value={playbookDialog.justification}
              onChange={(event) =>
                setPlaybookDialog((prev) => ({
                  ...prev,
                  justification: event.target.value,
                  error: "",
                }))
              }
              placeholder="Informe motivo operacional da execucao..."
            />
            {playbookDialog.error ? <small className="udy-demo-inline-error">{playbookDialog.error}</small> : null}
          </label>
        </div>
        <div className="bp6-dialog-footer">
          <div className="bp6-dialog-footer-actions">
            <Button text="Cancelar" onClick={() => setPlaybookDialog((prev) => ({ ...prev, isOpen: false, error: "" }))} />
            <Button intent="success" text="Executar" onClick={runPlaybook} />
          </div>
        </div>
      </Dialog>

      <Dialog
        className="udy-demo-overlay"
        title="Exportar trilha de auditoria"
        isOpen={isExportOpen}
        onClose={() => setExportOpen(false)}
      >
        <div className="bp6-dialog-body udy-demo-dialog-body">
          <pre className="udy-demo-export-pre">
            {JSON.stringify(
              simulation.auditTrail.map((entry) => ({
                timestamp: entry.timestamp,
                action: entry.action,
                scope: entry.scope,
                justification: entry.justification,
                hash: entry.hash,
              })),
              null,
              2,
            )}
          </pre>
        </div>
      </Dialog>

      <Dialog
        className="udy-demo-overlay"
        title="Politica de acesso (RBAC demo)"
        isOpen={isPolicyOpen}
        onClose={() => setPolicyOpen(false)}
      >
        <div className="bp6-dialog-body udy-demo-dialog-body">
          <ul className="udy-demo-policy-list">
            <li>
              <strong>Operador:</strong> visualizar eventos, acionar playbooks aprovados e registrar justificativas.
            </li>
            <li>
              <strong>Supervisor:</strong> executar qualquer playbook e aprovar escopos de risco alto.
            </li>
            <li>
              <strong>Auditoria:</strong> somente leitura da trilha, exportacao e validacao de hash.
            </li>
            <li>
              <strong>Admin:</strong> configura fontes, cenarios e niveis de ingestao.
            </li>
          </ul>
        </div>
      </Dialog>

      <OverlayToaster position={Position.BOTTOM_RIGHT} maxToasts={4} ref={toasterRef} />
    </div>
  );
}
