import { NextResponse } from "next/server";
import {
  fetchTransparenciaData,
  TRANSPARENCIA_ENDPOINTS,
} from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// This endpoint provides direct access to Portal da Transparência APIs
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    // If no endpoint specified, return list of available endpoints
    return NextResponse.json({
      success: true,
      message: "Especifique um endpoint do Portal da Transparência",
      availableEndpoints: TRANSPARENCIA_ENDPOINTS,
    });
  }

  // Handle special case for endpoint lookups by key
  let resolvedEndpoint = endpoint;
  if (
    endpoint.startsWith("$") &&
    endpoint.slice(1) in TRANSPARENCIA_ENDPOINTS
  ) {
    // User is requesting a predefined endpoint by key (e.g. $VIAGENS)
    const endpointKey = endpoint.slice(
      1
    ) as keyof typeof TRANSPARENCIA_ENDPOINTS;
    resolvedEndpoint = TRANSPARENCIA_ENDPOINTS[endpointKey];
    console.log(
      `[TRANSPARENCIA API] Resolved endpoint key ${endpoint} to ${resolvedEndpoint}`
    );
  }

  // Extract all other parameters as query params
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== "endpoint") {
      params[key] = value;
    }
  });

  // Add required parameters for specific endpoints if they're missing
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

  // Format dates as DD/MM/YYYY
  const formatDate = (date: Date): string => {
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  if (
    resolvedEndpoint.includes("viagens") &&
    (!params.dataIdaDe || !params.dataIdaAte)
  ) {
    // For travel endpoints, use current year if dates not specified
    if (!params.dataIdaDe) params.dataIdaDe = formatDate(firstDayOfYear);
    if (!params.dataIdaAte) params.dataIdaAte = formatDate(today);
    if (!params.pagina) params.pagina = "1";

    console.log(
      `[TRANSPARENCIA API] Added default date parameters: ${params.dataIdaDe} to ${params.dataIdaAte}`
    );
  }

  if (resolvedEndpoint.includes("licitacoes") && !params.pagina) {
    params.pagina = "1";
  }

  try {
    console.log(`[TRANSPARENCIA API] Fetching endpoint: ${resolvedEndpoint}`);
    console.log(`[TRANSPARENCIA API] With params:`, params);

    const data = await fetchTransparenciaData(resolvedEndpoint, params);

    return NextResponse.json({
      success: true,
      endpoint: resolvedEndpoint,
      params,
      data,
    });
  } catch (error) {
    console.error("[TRANSPARENCIA API ERROR]", error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch data from Portal da Transparência",
        details: errorMessage,
        endpoint: resolvedEndpoint,
        params,
      },
      { status: 500 }
    );
  }
}
