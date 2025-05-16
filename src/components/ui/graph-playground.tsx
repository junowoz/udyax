"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface GraphPlaygroundProps {
  chatQuery?: string;
}

interface ChartData {
  type: string;
  title: string;
  data: Record<string, unknown>[];
  xKey?: string;
  yKeys?: string[];
  labels?: string[];
  source?: string;
}

export function GraphPlayground({ chatQuery }: GraphPlaygroundProps) {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  useEffect(() => {
    if (!chatQuery) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching analysis for query:", chatQuery);
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: chatQuery }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response from analyze API:", errorText);
          throw new Error(`Error analyzing query: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Analysis result:", data);

        if (data.chartData) {
          setChartData(data.chartData);
        } else {
          setChartData(null);
          console.log("No chart data received");
        }
      } catch (err) {
        console.error("Error during analysis:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Falha ao analisar a consulta. Tente novamente mais tarde."
        );
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chatQuery]);

  const renderChart = () => {
    if (!chartData) return null;

    switch (chartData.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData.data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={chartData.xKey || "name"}
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartData.yKeys?.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[index % COLORS.length]}
                  name={key}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={150}
                fill="#8884d8"
                dataKey={chartData.yKeys?.[0] || "value"}
                nameKey={chartData.xKey || "name"}
              >
                {chartData.data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData.data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartData.xKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartData.yKeys?.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  name={key}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex justify-center items-center h-[400px] text-muted-foreground">
            Tipo de gráfico não suportado: {chartData.type}
          </div>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-lg">
          {loading
            ? "Analisando dados..."
            : chartData?.title || "Visualização de Dados"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-[400px] text-red-500">
            <div className="text-center">
              <p className="mb-2">Erro na análise dos dados</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : !chartData ? (
          <div className="flex justify-center items-center h-[400px] text-muted-foreground">
            <div className="text-center">
              <p className="mb-2">
                Faça uma pergunta sobre dados governamentais
              </p>
              <p className="text-sm">
                Exemplo: &quot;Quais deputados mais gastaram com a cota
                parlamentar?&quot; ou &quot;Quantos projetos de lei foram
                aprovados este ano?&quot;
              </p>
            </div>
          </div>
        ) : (
          <>
            {renderChart()}
            {chartData.source && (
              <div className="text-xs text-right text-muted-foreground mt-4">
                Fonte: {chartData.source}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
