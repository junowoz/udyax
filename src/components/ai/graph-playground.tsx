"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  BarChartBig,
  BarChartHorizontalBig,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";

interface Props {
  chatQuery?: string;
}

/**
 * Graph Playground component that shows visualizations for queries
 * Uses AI to analyze the query and generate a Python chart
 */
export function GraphPlayground({ chatQuery }: Props) {
  const [loading, setLoading] = useState(false);
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("Visualização de Dados");

  useEffect(() => {
    if (!chatQuery) {
      // Reset to default when no query is active
      setTitle("Visualização de Dados");
      setChartImage(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Reset states
    setLoading(true);
    setError(null);
    setChartImage(null);

    const generateVisualization = async () => {
      try {
        // First, analyze the query to extract data
        console.log("Analyzing query:", chatQuery);
        const analyzeResponse = await fetch("/api/analize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: chatQuery }),
        });

        if (!analyzeResponse.ok) {
          throw new Error(
            `Error analyzing query: ${analyzeResponse.statusText}`
          );
        }

        const analysisResult = await analyzeResponse.json();
        console.log("Analysis result:", analysisResult);

        if (!analysisResult.series || analysisResult.series.length === 0) {
          setError(
            "Não foi possível encontrar dados relevantes para visualização."
          );
          setLoading(false);
          return;
        }

        // Set a specific title based on the query
        if (
          chatQuery.toLowerCase().includes("gastos") ||
          chatQuery.toLowerCase().includes("despesas")
        ) {
          setTitle("Gastos Parlamentares");
        } else if (
          chatQuery.toLowerCase().includes("projeto") ||
          chatQuery.toLowerCase().includes("lei")
        ) {
          setTitle("Projetos de Lei");
        }

        // Then generate a chart using the Python chart generator
        const chartResponse = await fetch("/api/generate-chart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: analysisResult.series,
            chartType: analysisResult.type,
            query: chatQuery,
          }),
        });

        if (!chartResponse.ok) {
          const errorData = await chartResponse.json();
          throw new Error(errorData.details || "Falha ao gerar visualização");
        }

        const chartResult = await chartResponse.json();

        if (chartResult.image) {
          setChartImage(chartResult.image);
        } else {
          throw new Error("Imagem do gráfico não foi gerada");
        }
      } catch (err) {
        console.error("Error generating visualization:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Ocorreu um erro ao gerar a visualização"
        );
      } finally {
        setLoading(false);
      }
    };

    generateVisualization();
  }, [chatQuery]);

  return (
    // Applied consistent styling with ChatInterface
    <div className="flex flex-col h-[600px] w-full rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl overflow-hidden">
      <header className="px-4 py-3 border-b border-zinc-700 flex items-center gap-2">
        {/* Conditional icon based on content */}
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        ) : chartImage ? (
          <BarChartBig className="h-5 w-5 text-blue-400" />
        ) : error ? (
          <AlertTriangle className="h-5 w-5 text-red-400" />
        ) : (
          <BarChartHorizontalBig className="h-5 w-5 text-blue-400" />
        )}
        <h2 className="text-lg font-medium text-zinc-100">{title}</h2>
      </header>

      <div className="flex-grow flex items-center justify-center p-4 overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <p className="text-sm text-zinc-400">
              Gerando visualização para sua consulta...
            </p>
            <p className="text-xs text-zinc-500">
              Isso pode levar alguns segundos.
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 p-4">
            <AlertTriangle className="h-10 w-10 text-red-400 mb-2" />
            <p className="text-md font-medium text-red-400">
              Falha ao Gerar Gráfico
            </p>
            <p className="text-sm text-zinc-400 max-w-sm">{error}</p>
            <p className="text-xs text-zinc-500 mt-2">
              Verifique sua pergunta ou tente novamente mais tarde. Se o
              problema persistir, o formato dos dados pode não ser suportado
              para este tipo de visualização.
            </p>
          </div>
        ) : !chartImage ? (
          <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6">
            <BarChartHorizontalBig className="h-12 w-12 text-blue-400/70 mb-4" />
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">
              Visualizações Interativas
            </h3>
            <p className="text-sm text-zinc-400 mb-1 max-w-md">
              Este espaço exibirá gráficos e visualizações de dados relacionados
              à sua conversa com o assistente.
            </p>
            <p className="text-xs text-zinc-500 mt-4 text-center">
              Exemplo:{" "}
              {`"Quais deputados mais gastaram com a cota parlamentar?"`}
            </p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={chartImage}
              alt="Visualização gerada por IA"
              width={800}
              height={400}
              style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
              className="rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
}
