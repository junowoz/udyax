"use client";

import {
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  H4,
  Icon,
  Tab,
  Tabs,
  Tag,
} from "@blueprintjs/core";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Plottable from "plottable";
import type { TimeWindow } from "@/types/landing";

type LayerKey = "A" | "B" | "C";

type TimePoint = {
  date: Date;
  value: number;
  min?: number;
  max?: number;
  category?: string;
};

const timeWindowSize: Record<TimeWindow, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const categories = ["Trânsito", "Iluminação", "Resíduos", "Segurança"];

const layerOffsets: Record<LayerKey, number> = {
  A: 1,
  B: 0.82,
  C: 1.2,
};

function generateTimeline(window: TimeWindow, layer: LayerKey): TimePoint[] {
  const size = timeWindowSize[window];
  const base = new Date("2026-01-01T00:00:00Z");

  return Array.from({ length: size }).map((_, index) => {
    const date = new Date(base);
    date.setUTCDate(base.getUTCDate() + index);

    const beforeAfterPivot = Math.floor(size * 0.45);
    const before = 150 + Math.sin(index / 2.4) * 16;
    const after = 124 + Math.sin(index / 2.8) * 12;
    const optimized = index <= beforeAfterPivot ? before : after;

    return {
      date,
      value: Math.round(optimized * layerOffsets[layer]),
    };
  });
}

function generateIncidents(window: TimeWindow, layers: LayerKey[]): TimePoint[] {
  const volumeFactor = timeWindowSize[window] / 7;
  const layerFactor = layers.reduce((acc, item) => acc + layerOffsets[item], 0) / 3;

  return categories.map((category, index) => ({
    date: new Date(),
    category,
    value: Math.round((44 + index * 13) * volumeFactor * layerFactor),
  }));
}

function generateEnergy(window: TimeWindow): TimePoint[] {
  const size = timeWindowSize[window];
  const base = new Date("2026-01-01T00:00:00Z");

  return Array.from({ length: size }).map((_, index) => {
    const date = new Date(base);
    date.setUTCDate(base.getUTCDate() + index);

    const seasonal = 98 + Math.cos(index / 4) * 5;
    const demand = seasonal + (index % 10 === 0 ? 4 : 0);

    return {
      date,
      value: Math.round(demand),
      min: 94,
      max: 103,
    };
  });
}

type TooltipEntity = { datum: TimePoint };

type TooltipPlot = {
  entitiesAt: (point: { x: number; y: number }) => TooltipEntity[];
};

function attachTooltip(
  plot: TooltipPlot & Plottable.Component,
  host: HTMLDivElement,
  formatValue: (datum: TimePoint) => string,
) {
  const tooltip = document.createElement("div");
  tooltip.className = "udy-tooltip";
  tooltip.style.display = "none";
  host.appendChild(tooltip);

  const pointer = new Plottable.Interactions.Pointer();

  pointer.onPointerMove((point) => {
    const entities = plot.entitiesAt(point);

    if (entities.length === 0) {
      tooltip.style.display = "none";
      return;
    }

    const datum = entities[0].datum;
    tooltip.textContent = formatValue(datum);
    tooltip.style.display = "block";
    tooltip.style.left = `${point.x + 12}px`;
    tooltip.style.top = `${point.y + 10}px`;
  });

  pointer.onPointerExit(() => {
    tooltip.style.display = "none";
  });

  pointer.attachTo(plot);

  return () => {
    tooltip.remove();
    pointer.detachFrom(plot);
  };
}

function renderFluxChart(container: HTMLDivElement, window: TimeWindow, activeLayers: LayerKey[]) {
  container.innerHTML = "";

  const xScale = new Plottable.Scales.Time();
  const yScale = new Plottable.Scales.Linear();
  const colorScale = new Plottable.Scales.Color().domain(["Corredor A", "Corredor B", "Corredor C"]);

  const plot = new Plottable.Plots.Line();
  plot.x((d: TimePoint) => d.date, xScale).y((d: TimePoint) => d.value, yScale).attr("stroke-width", 2);

  activeLayers.forEach((layer) => {
    const label = `Corredor ${layer}`;
    const dataset = new Plottable.Dataset(generateTimeline(window, layer), { name: label });
    plot.addDataset(dataset);
  });

  plot.attr("stroke", (_d: TimePoint, _i: number, ds: Plottable.Dataset) => {
    return colorScale.scale(String(ds.metadata().name));
  });

  const gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  const group = new Plottable.Components.Group([gridlines, plot]);
  const xAxis = new Plottable.Axes.Time(xScale, "bottom");
  const yAxis = new Plottable.Axes.Numeric(yScale, "left");
  const legend = new Plottable.Components.Legend(colorScale);

  const table = new Plottable.Components.Table([
    [yAxis, group, legend],
    [null, xAxis, null],
  ]);

  table.renderTo(container);

  const cleanup = attachTooltip(plot, container, (datum) => {
    const day = datum.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return `${day}: ${datum.value} veículos/h`;
  });

  return () => {
    cleanup();
    table.destroy();
  };
}

function renderIncidentChart(container: HTMLDivElement, window: TimeWindow, activeLayers: LayerKey[]) {
  container.innerHTML = "";

  const data = generateIncidents(window, activeLayers);
  const xScale = new Plottable.Scales.Category();
  const yScale = new Plottable.Scales.Linear();
  const colorScale = new Plottable.Scales.Color().domain(categories);

  const dataset = new Plottable.Dataset(data);
  const plot = new Plottable.Plots.Bar();

  plot
    .addDataset(dataset)
    .x((d: TimePoint) => String(d.category), xScale)
    .y((d: TimePoint) => d.value, yScale)
    .attr("fill", (d: TimePoint) => colorScale.scale(String(d.category)))
    .labelsEnabled(true);

  const xAxis = new Plottable.Axes.Category(xScale, "bottom");
  const yAxis = new Plottable.Axes.Numeric(yScale, "left");
  const gridlines = new Plottable.Components.Gridlines(null, yScale);
  const group = new Plottable.Components.Group([gridlines, plot]);
  const legend = new Plottable.Components.Legend(colorScale);
  const table = new Plottable.Components.Table([
    [yAxis, group, legend],
    [null, xAxis, null],
  ]);

  table.renderTo(container);

  const cleanup = attachTooltip(plot, container, (datum) => `${datum.category}: ${datum.value} incidentes`);

  return () => {
    cleanup();
    table.destroy();
  };
}

function renderEnergyChart(container: HTMLDivElement, window: TimeWindow) {
  container.innerHTML = "";

  const data = generateEnergy(window);
  const xScale = new Plottable.Scales.Time();
  const yScale = new Plottable.Scales.Linear();

  const area = new Plottable.Plots.Area();
  area
    .addDataset(new Plottable.Dataset(data))
    .x((d: TimePoint) => d.date, xScale)
    .y((d: TimePoint) => d.max ?? d.value, yScale)
    .y0((d: TimePoint) => d.min ?? d.value)
    .attr("fill", "#394b59")
    .attr("fill-opacity", 0.35)
    .attr("stroke", "transparent");

  const line = new Plottable.Plots.Line();
  line
    .addDataset(new Plottable.Dataset(data))
    .x((d: TimePoint) => d.date, xScale)
    .y((d: TimePoint) => d.value, yScale)
    .attr("stroke", "#48aff0")
    .attr("stroke-width", 2.2);

  const xAxis = new Plottable.Axes.Time(xScale, "bottom");
  const yAxis = new Plottable.Axes.Numeric(yScale, "left");
  const gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  const group = new Plottable.Components.Group([gridlines, area, line]);
  const table = new Plottable.Components.Table([
    [yAxis, group],
    [null, xAxis],
  ]);

  table.renderTo(container);

  const cleanup = attachTooltip(line, container, (datum) => {
    const day = datum.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return `${day}: ${datum.value} MWh (meta: 94-103)`;
  });

  return () => {
    cleanup();
    table.destroy();
  };
}

const sourceStatus = [
  { name: "IoT de tráfego", events: "1.240 evt/min", latency: "38 ms" },
  { name: "Câmeras e metadados", events: "890 evt/min", latency: "55 ms" },
  { name: "Iluminação pública", events: "420 evt/min", latency: "27 ms" },
  { name: "Resíduos urbanos", events: "190 evt/min", latency: "62 ms" },
];

const mapPoints = [
  { label: "Anomalia de fluxo", top: "22%", left: "38%", severity: "high" },
  { label: "Falha de iluminação", top: "58%", left: "64%", severity: "medium" },
  { label: "Acúmulo de resíduos", top: "44%", left: "25%", severity: "medium" },
  { label: "Intervenção em corredor", top: "71%", left: "48%", severity: "low" },
  { label: "Evento de segurança", top: "32%", left: "72%", severity: "high" },
];

export default function UrbanChartPanel() {
  const [selectedTab, setSelectedTab] = useState<string>("ops");
  const [window, setWindow] = useState<TimeWindow>("30d");
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ A: true, B: true, C: true });

  const fluxRef = useRef<HTMLDivElement | null>(null);
  const incidentsRef = useRef<HTMLDivElement | null>(null);
  const energyRef = useRef<HTMLDivElement | null>(null);

  const activeLayers = useMemo(
    () => (Object.keys(layers) as LayerKey[]).filter((layer) => layers[layer]),
    [layers],
  );

  useEffect(() => {
    if (selectedTab !== "analytics") return;

    const cleanups: Array<() => void> = [];

    if (fluxRef.current) {
      cleanups.push(renderFluxChart(fluxRef.current, window, activeLayers.length > 0 ? activeLayers : ["A"]));
    }
    if (incidentsRef.current) {
      cleanups.push(
        renderIncidentChart(incidentsRef.current, window, activeLayers.length > 0 ? activeLayers : ["A"]),
      );
    }
    if (energyRef.current) {
      cleanups.push(renderEnergyChart(energyRef.current, window));
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [activeLayers, selectedTab, window]);

  function toggleLayer(layer: LayerKey) {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }

  return (
    <div className="udy-workspace">
      <Tabs id="urban-signals-tabs" selectedTabId={selectedTab} onChange={(tab) => setSelectedTab(String(tab))}>
        <Tab
          id="ops"
          title="Sala Operacional"
          panel={
            <div className="udy-ops-layout">
              <Card className="udy-map-card" elevation={1}>
                <header className="udy-panel-head">
                  <H4>Mapa urbano em camadas</H4>
                  <Tag minimal intent="primary">
                    Geoespacial
                  </Tag>
                </header>
                <div className="udy-city-map" role="img" aria-label="Mapa operacional com eventos urbanos">
                  <div className="udy-map-grid" />
                  {mapPoints.map((point) => (
                    <button
                      key={point.label}
                      type="button"
                      className={`udy-map-point udy-map-point-${point.severity}`}
                      style={{ top: point.top, left: point.left }}
                      aria-label={point.label}
                      title={point.label}
                    />
                  ))}
                </div>
              </Card>

              <Card className="udy-side-card" elevation={1}>
                <header className="udy-panel-head">
                  <H4>Camadas ativas</H4>
                </header>
                <div className="udy-layer-toggles">
                  {(["A", "B", "C"] as LayerKey[]).map((layer) => (
                    <Checkbox
                      key={layer}
                      checked={layers[layer]}
                      label={`Corredor ${layer}`}
                      onChange={() => toggleLayer(layer)}
                    />
                  ))}
                </div>
                <div className="udy-stat-blocks">
                  <article>
                    <span>Eventos correlacionados</span>
                    <strong className="tabular-nums">3.410/h</strong>
                  </article>
                  <article>
                    <span>Fontes sincronizadas</span>
                    <strong className="tabular-nums">184</strong>
                  </article>
                  <article>
                    <span>Tempo de resposta</span>
                    <strong className="tabular-nums">42 ms</strong>
                  </article>
                </div>
              </Card>

              <Card className="udy-side-card" elevation={1}>
                <header className="udy-panel-head">
                  <H4>Fontes e ingestão</H4>
                </header>
                <ul className="udy-source-list">
                  {sourceStatus.map((source) => (
                    <li key={source.name}>
                      <span>{source.name}</span>
                      <span className="tabular-nums">{source.events}</span>
                      <small className="tabular-nums">latência {source.latency}</small>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          }
        />

        <Tab
          id="analytics"
          title="Séries Analíticas"
          panel={
            <div className="udy-charts-wrap">
              <div className="udy-chart-controls">
                <div className="udy-control-block">
                  <span className="udy-control-label">Janela temporal</span>
                  <ButtonGroup>
                    {(["7d", "30d", "90d"] as TimeWindow[]).map((item) => (
                      <Button
                        key={item}
                        small
                        active={window === item}
                        text={item}
                        onClick={() => setWindow(item)}
                      />
                    ))}
                  </ButtonGroup>
                </div>
              </div>

              <Card className="udy-chart-card" elevation={1}>
                <header className="udy-chart-card-head">
                  <div>
                    <H4>Fluxo de veículos por corredor</H4>
                    <p className="text-pretty">Impacto de intervenção operacional por janela temporal.</p>
                  </div>
                </header>
                <div ref={fluxRef} className="udy-chart-canvas" />
              </Card>

              <Card className="udy-chart-card" elevation={1}>
                <header className="udy-chart-card-head">
                  <div>
                    <H4>Incidentes por categoria</H4>
                    <p className="text-pretty">Distribuição de pressão operacional por domínio de serviço.</p>
                  </div>
                </header>
                <div ref={incidentsRef} className="udy-chart-canvas" />
              </Card>

              <Card className="udy-chart-card" elevation={1}>
                <header className="udy-chart-card-head">
                  <div>
                    <H4>Consumo energético vs meta</H4>
                    <p className="text-pretty">Banda de estabilidade e variação ao longo do período.</p>
                  </div>
                </header>
                <div ref={energyRef} className="udy-chart-canvas" />
              </Card>
            </div>
          }
        />
      </Tabs>

      <p className="udy-chart-footnote">
        <Icon icon="info-sign" size={14} />
        Painel conceitual de operação urbana com múltiplas fontes e camadas.
      </p>
    </div>
  );
}
