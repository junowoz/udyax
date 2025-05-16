// Lightweight helper for Câmara dos Deputados – real‑time JSON only
export const CAMARA_BASE = "https://dadosabertos.camara.leg.br/api/v2";

export async function fetchCamara(
  endpoint: string,
  params: Record<string, string | number> = {}
) {
  const url = new URL(`${CAMARA_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) =>
    url.searchParams.append(k, String(v))
  );

  const r = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 }, // cache 60 s – cheap & always fresh enough for demo
  });
  if (!r.ok) throw new Error(`Camara API ${r.status}`);
  return (await r.json()).dados;
}
