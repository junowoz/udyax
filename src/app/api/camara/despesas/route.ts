// src/app/api/camara/despesas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchCamara } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const ano = req.nextUrl.searchParams.get("ano") ?? new Date().getFullYear();
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const data = await fetchCamara(`deputados/${id}/despesas`, {
    ano,
    itens: 100,
  });
  return NextResponse.json(data.dados);
}
