// src/app/api/camara/projetos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchCamara } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const ano = req.nextUrl.searchParams.get("ano") ?? new Date().getFullYear();
  const tipo = req.nextUrl.searchParams.get("siglaTipo") ?? "PL"; // projeto de lei
  const data = await fetchCamara("proposicoes", {
    ano,
    siglaTipo: tipo,
    ordenarPor: "dataApresentacao",
    ordem: "DESC",
    itens: 50,
  });
  return NextResponse.json(data.dados);
}
