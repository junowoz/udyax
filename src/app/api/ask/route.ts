// Path: src/app/api/ask/route.ts - API route for chat queries
import { NextResponse } from "next/server";

// Definir um tipo para os dados das respostas
type ScopeData = "promessometro" | "votacoes" | "licitacoes" | "gastos";
type MockResponseData = Record<
  ScopeData,
  {
    data: Record<string, string | number>[];
    message: string;
  }
>;

// Mock response data based on scope
const mockResponses: MockResponseData = {
  promessometro: {
    data: [
      {
        politico: "David Almeida",
        promessa: "Construir 5 novas UPAs",
        status: "Em andamento",
      },
      {
        politico: "Luiz Castro",
        promessa: "Reformar 10 escolas",
        status: "Concluído",
      },
      {
        politico: "Arthur Virgílio",
        promessa: "Revitalizar o Centro",
        status: "Não iniciado",
      },
    ],
    message: "Dados do Promessômetro para políticos de Manaus",
  },
  votacoes: {
    data: [
      { politico: "Eduardo Braga", sessao: "PL 123/2023", voto: "Favorável" },
      { politico: "Omar Aziz", sessao: "PL 123/2023", voto: "Contrário" },
      {
        politico: "Wilson Lima",
        sessao: "Emenda Orçamentária 45",
        voto: "Abstenção",
      },
    ],
    message: "Resultados das votações recentes",
  },
  licitacoes: {
    data: [
      {
        numero: "2023-045",
        objeto: "Pavimentação av. Torquato Tapajós",
        valor: "R$ 5.400.000",
        status: "Em andamento",
      },
      {
        numero: "2023-037",
        objeto: "Revitalização do Porto",
        valor: "R$ 12.800.000",
        status: "Concluído",
      },
      {
        numero: "2023-028",
        objeto: "Compra de medicamentos",
        valor: "R$ 3.200.000",
        status: "Cancelado",
      },
    ],
    message: "Licitações recentes encontradas",
  },
  gastos: {
    data: [
      {
        secretaria: "Saúde",
        ano: "2023",
        orcamento: "R$ 1.200.000.000",
        executado: "R$ 980.000.000",
      },
      {
        secretaria: "Educação",
        ano: "2023",
        orcamento: "R$ 800.000.000",
        executado: "R$ 750.000.000",
      },
      {
        secretaria: "Infraestrutura",
        ano: "2023",
        orcamento: "R$ 500.000.000",
        executado: "R$ 300.000.000",
      },
    ],
    message: "Gastos públicos por secretaria",
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scope, query } = body;

    // Validate input
    if (!scope || !query) {
      return NextResponse.json(
        {
          error: "Parâmetros inválidos",
          message: "Scope e query são obrigatórios",
        },
        { status: 400 }
      );
    }

    // Check if scope is valid
    if (!Object.keys(mockResponses).includes(scope)) {
      return NextResponse.json(
        {
          error: "Scope inválido",
          message:
            "Scope deve ser: promessometro, votacoes, licitacoes ou gastos",
        },
        { status: 400 }
      );
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return mock response based on scope
    return NextResponse.json({
      success: true,
      query,
      scope,
      timestamp: new Date().toISOString(),
      // @ts-expect-error - Já validamos o scope acima, mas o TypeScript não consegue inferir que scope é uma chave válida de mockResponses
      ...mockResponses[scope],
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        message: "Falha ao processar a solicitação",
      },
      { status: 500 }
    );
  }
}
