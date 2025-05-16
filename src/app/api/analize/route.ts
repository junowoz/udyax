import { fetchCamara } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

interface Deputy {
  id: number;
  nome: string;
  [key: string]: unknown;
}

interface Expense {
  valorLiquido: number;
  [key: string]: unknown;
}

interface Proposition {
  siglaTipo: string;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  const { query } = (await req.json()) as { query: string };

  // **Very** naive intent parsing – good enough for YC video.
  if (/gasto|cota|despesa/i.test(query)) {
    // get top‑5 spenders this year (2025) – demo purpose
    const year = new Date().getFullYear();
    const deputies = (await fetchCamara("deputados")) as Deputy[];
    const data = await Promise.all(
      deputies.slice(0, 30).map(async (d: Deputy) => {
        const despesas = (await fetchCamara(`deputados/${d.id}/despesas`, {
          ano: year,
        })) as Expense[];
        const total = despesas.reduce(
          (s: number, item: Expense) => s + item.valorLiquido,
          0
        );
        return { nome: d.nome, total };
      })
    );
    const top = data.sort((a, b) => b.total - a.total).slice(0, 5);
    return NextResponse.json({ type: "bar", series: top });
  }

  if (/projeto|pl |proposi/i.test(query)) {
    const props = (await fetchCamara("proposicoes", {
      dataInicio: `${new Date().getFullYear()}-01-01`,
    })) as Proposition[];
    const grouped: Record<string, number> = {};
    props.forEach((p: Proposition) => {
      grouped[p.siglaTipo] = (grouped[p.siglaTipo] ?? 0) + 1;
    });
    const chart = Object.entries(grouped)
      .map(([k, v]) => ({ type: k, qtd: v }))
      .slice(0, 6);
    return NextResponse.json({ type: "pie", series: chart });
  }

  // fallback empty
  return NextResponse.json({ type: "none", series: [] });
}
