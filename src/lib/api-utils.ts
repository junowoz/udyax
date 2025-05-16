// API utility functions for fetching government data

// Portal da Transparência API Key
// Load API key from environment variables
const TRANSPARENCIA_API_KEY = process.env.TRANSPARENCIA_API_KEY || "";

// Base URLs for different government APIs
const API_URLS = {
  camara: "https://dadosabertos.camara.leg.br/api/v2",
  senado: "https://legis.senado.leg.br/dadosabertos",
  transparencia: "https://api.portaldatransparencia.gov.br/api-de-dados",
};

// Portal da Transparência API endpoints
export const TRANSPARENCIA_ENDPOINTS = {
  // Viagens
  VIAGENS: "api-de-dados/viagens",
  VIAGENS_ID: "api-de-dados/viagens/{id}",
  VIAGENS_POR_CPF: "api-de-dados/viagens-por-cpf",

  // Servidores
  SERVIDORES: "api-de-dados/servidores",
  SERVIDORES_ID: "api-de-dados/servidores/{id}",
  SERVIDORES_REMUNERACAO: "api-de-dados/servidores/remuneracao",
  SERVIDORES_POR_ORGAO: "api-de-dados/servidores/por-orgao",
  SERVIDORES_FUNCOES_CARGOS: "api-de-dados/servidores/funcoes-e-cargos",

  // Benefícios
  BOLSA_FAMILIA_MUNICIPIO: "api-de-dados/bolsa-familia-por-municipio",
  BOLSA_FAMILIA_POR_NIS: "api-de-dados/bolsa-familia-sacado-por-nis",
  AUXILIO_EMERGENCIAL_MUNICIPIO:
    "api-de-dados/auxilio-emergencial-por-municipio",
  AUXILIO_EMERGENCIAL_CPF_NIS:
    "api-de-dados/auxilio-emergencial-por-cpf-ou-nis",

  // Licitações
  LICITACOES: "api-de-dados/licitacoes",
  LICITACOES_ID: "api-de-dados/licitacoes/{id}",
  LICITACOES_UGS: "api-de-dados/licitacoes/ugs",
  LICITACOES_MODALIDADES: "api-de-dados/licitacoes/modalidades",

  // Emendas parlamentares
  EMENDAS: "api-de-dados/emendas",
  EMENDAS_DOCUMENTOS: "api-de-dados/emendas/documentos/{codigo}",

  // Despesas
  DESPESAS_POR_ORGAO: "api-de-dados/despesas/por-orgao",
  DESPESAS_FUNCIONAL: "api-de-dados/despesas/por-funcional-programatica",
};

// Function to fetch data from the Câmara dos Deputados API
export async function fetchCamaraData(endpoint: string, params = {}) {
  const url = new URL(`${API_URLS.camara}/${endpoint}`);

  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  console.log(`[CAMARA API] Fetching: ${url.toString()}`);
  console.log(`[CAMARA API] Params:`, params);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[CAMARA API] Error response (${response.status}):`,
        errorText
      );
      throw new Error(`Error fetching Câmara data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[CAMARA API] Response for ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`[CAMARA API] Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

// Function to fetch data from the Portal da Transparência API
export async function fetchTransparenciaData(endpoint: string, params = {}) {
  // Handle endpoint with path parameters
  const processedEndpoint = endpoint.includes("{")
    ? replacePathParams(endpoint, params)
    : endpoint;

  const url = new URL(`${API_URLS.transparencia}/${processedEndpoint}`);

  // Add query parameters, filtering out any that were used in path parameters
  const queryParams = endpoint.includes("{")
    ? filterUsedPathParams(endpoint, params)
    : params;

  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  console.log(`[TRANSPARENCIA API] Fetching: ${url.toString()}`);
  console.log(`[TRANSPARENCIA API] Original endpoint: ${endpoint}`);
  console.log(`[TRANSPARENCIA API] Processed endpoint: ${processedEndpoint}`);
  console.log(`[TRANSPARENCIA API] Query params:`, queryParams);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "chave-api-dados": TRANSPARENCIA_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[TRANSPARENCIA API] Error response (${response.status}):`,
        errorText
      );
      throw new Error(
        `Error fetching Transparência data: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`[TRANSPARENCIA API] Response for ${processedEndpoint}:`, data);
    return data;
  } catch (error) {
    console.error(
      `[TRANSPARENCIA API] Failed to fetch ${processedEndpoint}:`,
      error
    );
    throw error;
  }
}

// Function to fetch data from the Senado Federal API
export async function fetchSenadoData(endpoint: string, params = {}) {
  const url = new URL(`${API_URLS.senado}/${endpoint}`);

  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  console.log(`[SENADO API] Fetching: ${url.toString()}`);
  console.log(`[SENADO API] Params:`, params);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[SENADO API] Error response (${response.status}):`,
        errorText
      );
      throw new Error(`Error fetching Senado data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[SENADO API] Response for ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`[SENADO API] Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

// Helper function to replace path parameters in endpoints like "api/endpoint/{id}"
function replacePathParams(
  endpoint: string,
  params: Record<string, string | number>
): string {
  let result = endpoint;
  const pathParamRegex = /{([^}]+)}/g;
  let match;

  while ((match = pathParamRegex.exec(endpoint)) !== null) {
    const paramName = match[1];
    if (params[paramName]) {
      result = result.replace(`{${paramName}}`, String(params[paramName]));
    } else {
      console.warn(`Missing path parameter: ${paramName}`);
    }
  }

  return result;
}

// Helper function to filter out params that were used in path substitution
function filterUsedPathParams(
  endpoint: string,
  params: Record<string, string | number>
): Record<string, string | number> {
  const filteredParams = { ...params };
  const pathParamRegex = /{([^}]+)}/g;
  let match;

  while ((match = pathParamRegex.exec(endpoint)) !== null) {
    const paramName = match[1];
    if (filteredParams[paramName]) {
      delete filteredParams[paramName];
    }
  }

  return filteredParams;
}

// Helper function to format and structure data for charts
export function formatDataForCharts(
  data: Record<string, unknown>,
  chartType: string
) {
  // Different formatting based on chart type
  switch (chartType) {
    case "bar":
      // Format for bar charts
      return data;
    case "line":
      // Format for line charts
      return data;
    case "pie":
      // Format for pie charts
      return data;
    default:
      return data;
  }
}
