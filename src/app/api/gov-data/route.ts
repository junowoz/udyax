import { NextResponse } from "next/server";
import {
  fetchCamaraData,
  fetchTransparenciaData,
  fetchSenadoData,
} from "@/lib/api-utils";

export const dynamic = "force-dynamic"; // Ensure the route is always dynamically rendered

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");
  const endpoint = searchParams.get("endpoint");

  // Extract all other parameters
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== "source" && key !== "endpoint") {
      params[key] = value;
    }
  });

  if (!source || !endpoint) {
    return NextResponse.json(
      { error: "Source and endpoint parameters are required" },
      { status: 400 }
    );
  }

  try {
    let data;

    switch (source) {
      case "camara":
        data = await fetchCamaraData(endpoint, params);
        break;
      case "senado":
        data = await fetchSenadoData(endpoint, params);
        break;
      case "transparencia":
        data = await fetchTransparenciaData(endpoint, params);
        break;
      default:
        return NextResponse.json(
          {
            error:
              "Invalid source. Must be one of: camara, senado, transparencia",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GOV-DATA API ERROR]", error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: "Failed to fetch government data", details: errorMessage },
      { status: 500 }
    );
  }
}
