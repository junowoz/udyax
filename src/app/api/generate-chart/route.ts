import { NextRequest, NextResponse } from "next/server";

// Define types for chart data
type ChartDataPoint =
  | { nome: string; total: number; [key: string]: unknown }
  | { type: string; qtd: number; [key: string]: unknown }
  | { [key: string]: unknown };

interface ChartRequestBody {
  data: ChartDataPoint[];
  chartType: string;
  query: string;
}

// Add types for chart context and other chart-related interfaces
interface ChartContext {
  dataset: {
    label: string;
    data: number[];
  };
  parsed: {
    x: number | null;
    y: number | null;
  };
}

interface ChartElement {
  x: number;
  y: number;
}

interface ChartDatasetMeta {
  data: ChartElement[];
  hidden: boolean;
}

interface ChartInstance {
  ctx: CanvasRenderingContext2D;
  data: {
    datasets: Array<{
      data: number[];
    }>;
  };
  getDatasetMeta(index: number): ChartDatasetMeta;
  config: {
    type: string;
  };
}

// Set runtime configuration for API route
export const runtime = "nodejs";

/**
 * API route that generates a chart using QuickChart API
 */
export async function POST(req: NextRequest) {
  try {
    const { data, chartType, query } = (await req.json()) as ChartRequestBody;

    if (!data || data.length === 0 || !chartType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    console.log(`[CHART API] Received request for ${chartType} chart`);
    console.log(`[CHART API] Data sample:`, data.slice(0, 2));

    // Generate chart image using QuickChart
    const chartImage = await generateChartWithQuickChart(
      data,
      chartType,
      query
    );

    return NextResponse.json({
      image: chartImage,
      success: true,
    });
  } catch (error) {
    console.error("[CHART API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate chart",
        details: error instanceof Error ? error.message : String(error),
        fallbackMessage:
          "Estamos com dificuldades técnicas para gerar visualizações. Nossa equipe está trabalhando para resolver o problema.",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate chart using QuickChart API
 */
async function generateChartWithQuickChart(
  data: ChartDataPoint[],
  chartType: string,
  query: string
): Promise<string> {
  // Sort data by total value in descending order
  const sortedData = [...data].sort((a, b) => {
    const valA = Number(a.total || a.qtd || 0);
    const valB = Number(b.total || b.qtd || 0);
    return valB - valA;
  });

  // Limit to top 10 items if there are more to prevent overcrowding
  const limitedData =
    sortedData.length > 10 ? sortedData.slice(0, 10) : sortedData;

  // Prepare labels and values
  const labels = limitedData.map(
    (item) => item.nome || item.type || "Sem nome"
  );
  const values = limitedData.map((item) => item.total || item.qtd || 0);

  // Get a color palette for the bars - different shades of blue
  const backgroundColor = [
    "rgba(65, 105, 225, 0.8)", // RoyalBlue
    "rgba(30, 144, 255, 0.8)", // DodgerBlue
    "rgba(0, 191, 255, 0.8)", // DeepSkyBlue
    "rgba(135, 206, 235, 0.8)", // SkyBlue
    "rgba(135, 206, 250, 0.8)", // LightSkyBlue
    "rgba(70, 130, 180, 0.8)", // SteelBlue
    "rgba(100, 149, 237, 0.8)", // CornflowerBlue
    "rgba(123, 104, 238, 0.8)", // MediumSlateBlue
    "rgba(106, 90, 205, 0.8)", // SlateBlue
    "rgba(72, 61, 139, 0.8)", // DarkSlateBlue
  ];

  // Determine chart type for QuickChart
  const quickChartType = chartType === "bar" ? "horizontalBar" : chartType;

  // Build the chart configuration
  const chartConfig = {
    type: quickChartType,
    data: {
      labels: labels,
      datasets: [
        {
          label: "Valores",
          data: values,
          backgroundColor: backgroundColor,
          borderColor: backgroundColor.map((color) =>
            color.replace("0.8", "1")
          ),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      indexAxis: chartType === "bar" ? "y" : "x",
      plugins: {
        title: {
          display: true,
          text: query,
          font: {
            size: 18,
            weight: "bold",
          },
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context: ChartContext) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null || context.parsed.x !== null) {
                const value = context.parsed.y ?? context.parsed.x;
                label += new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(value as number);
              }
              return label;
            },
          },
        },
        datalabels: {
          formatter: function (value: number) {
            return new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            }).format(value);
          },
          color: "#000",
          anchor: "end",
          align: "start",
        },
      },
      scales: {
        x: {
          ticks: {
            callback: function (value: number) {
              return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              }).format(value);
            },
          },
          title: {
            display: true,
            text: "Valor (R$)",
          },
        },
        y: {
          title: {
            display: true,
            text: chartType === "bar" ? "Deputado" : "",
          },
        },
      },
    },
  };

  // Add chart plugin to format currency values
  const chartPlugins = [
    {
      id: "datalabels",
      afterDatasetsDraw: function (chart: ChartInstance) {
        const ctx = chart.ctx;
        chart.data.datasets.forEach(function (
          dataset: { data: number[] },
          i: number
        ) {
          const meta = chart.getDatasetMeta(i);
          if (!meta.hidden) {
            meta.data.forEach(function (element: ChartElement, index: number) {
              // Draw value text
              const value = dataset.data[index];
              const formattedValue = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              }).format(value);

              ctx.fillStyle = "#000";
              ctx.font = "bold 12px Arial";

              // Position for horizontal bar chart
              if (chart.config.type === "horizontalBar") {
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fillText(
                  formattedValue,
                  Number(element.x) + 5,
                  Number(element.y)
                );
              } else {
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText(
                  formattedValue,
                  Number(element.x),
                  Number(element.y) - 5
                );
              }
            });
          }
        });
      },
    },
  ];

  // Add plugins to the chart configuration
  chartConfig.options.plugins = {
    ...chartConfig.options.plugins,
    ...chartPlugins,
  };

  // Generate the chart URL using QuickChart
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify(chartConfig)
  )}&width=800&height=400&format=png&backgroundColor=white`;

  try {
    // Fetch the chart image from QuickChart API
    const response = await fetch(chartUrl);

    if (!response.ok) {
      throw new Error(`QuickChart API returned status ${response.status}`);
    }

    // Convert the image to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error(`[CHART API] QuickChart API error:`, error);
    throw new Error("Failed to generate chart with QuickChart API");
  }
}
