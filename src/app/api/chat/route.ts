import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

// Ensure your OPENAI_API_KEY environment variable is set
// For example, in a .env.local file:
// OPENAI_API_KEY="your-openai-api-key"

export const dynamic = "force-dynamic"; // Ensure the route is always dynamically rendered

// Interface para a estrutura de mensagem
interface ChatMessage {
  role: string;
  content: string;
  id?: string;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    console.log(
      `[API CHAT] Processing chat request with ${messages.length} messages`
    );

    // Log last user message
    const lastUserMessage = messages
      .filter((m: ChatMessage) => m.role === "user")
      .pop();
    if (lastUserMessage) {
      console.log(`[API CHAT] Last user message: "${lastUserMessage.content}"`);
    }

    // Verifique se há uma mensagem do sistema específica, se não, use uma padrão
    const hasSystemMessage = messages.some(
      (m: ChatMessage) => m.role === "system"
    );

    console.log(`[API CHAT] Has system message: ${hasSystemMessage}`);

    // Se não houver mensagem do sistema, adicione uma padrão
    const messagesWithSystemIfNeeded = hasSystemMessage
      ? messages
      : [
          {
            role: "system",
            content: `Você é um assistente especializado em dados governamentais e políticos brasileiros.
            
            ESCOPO DE RESPOSTA:
            1. Responda APENAS perguntas relacionadas a:
               - Promessas de campanha de políticos e seu status de execução
               - Gastos públicos e orçamento
               - Votações na Câmara e Senado
               - Projetos de lei e status
               - Dados eleitorais
            
            2. Se a pergunta estiver fora desse escopo, explique educadamente que você só pode responder sobre dados governamentais brasileiros.
            
            3. Base suas respostas em dados factuais de:
               - Portal da Transparência
               - Site da Câmara dos Deputados (api.camara.leg.br)
               - Site do Senado Federal (legis.senado.leg.br)
               - Portal do TSE (Tribunal Superior Eleitoral)
               - IBGE e outras fontes oficiais
            
            4. Quando possível, cite sua fonte e a data da informação.
            
            5. Seja imparcial e focado em dados, não em opiniões políticas.
            
            6. IMPORTANTE: Suas respostas devem ser EXTREMAMENTE CURTAS e DIRETAS. Use no máximo 3 frases.
               - Evite introduções como "De acordo com dados...", "Os dados mostram que..."
               - Vá direto ao ponto com a informação solicitada
               - Use frases curtas e objetivas
               - Inclua apenas os dados mais importantes e relevantes
               - Omita explicações, contextualizações ou detalhes secundários
            
            7. Responda como um especialista em dados, de forma técnica e precisa, mas com extrema concisão.
            
            8. Para respostas numéricas, use apenas 1-2 frases com os números mais importantes.
            
            9. MUITO IMPORTANTE: Se o usuário perguntar sobre dados que podem ser visualizados em gráficos (como gastos de deputados, 
               orçamento por órgão, estatísticas de votação), incentive-o a observar a visualização que aparecerá ao lado. 
               Exemplo: "Os dados de gastos dos deputados serão mostrados na visualização ao lado." ou "Veja o gráfico para 
               os maiores gastos parlamentares."
            
            10. INFORMAÇÕES ATUALIZADAS:
                - O ano atual é ${new Date().getFullYear()}
                - Os gastos com saúde nos últimos anos foram:
                  * ${new Date().getFullYear() - 2}: R$ 177,3 bilhões
                  * ${new Date().getFullYear() - 1}: R$ 190,5 bilhões 
                  * ${new Date().getFullYear()}: R$ 213,8 bilhões (estimativa)
            `,
          },
          ...messages,
        ];

    if (!hasSystemMessage) {
      console.log(`[API CHAT] Added default system message`);
    }

    console.log(
      `[API CHAT] Sending ${messagesWithSystemIfNeeded.length} messages to OpenAI`
    );

    const result = await streamText({
      model: openai("gpt-4.1-nano"),
      messages: messagesWithSystemIfNeeded,
      temperature: 0.7, // Alguma variação mas não muito para manter factualidade
      maxTokens: 300, // Limitar ainda mais o tamanho das respostas
    });

    console.log(`[API CHAT] OpenAI response received, streaming to client`);

    // Use the raw stream with the standard Response object
    const responseStream = result.toDataStream();

    // Create new stream reader and start logging in background without blocking
    startBackgroundLogging(responseStream);

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[API CHAT POST ERROR]", error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: "Failed to process chat request", details: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to log stream response without affecting the client
function startBackgroundLogging(_stream: ReadableStream<Uint8Array>) {
  // Cannot directly read the stream as it's being consumed by the client
  // Instead, log a message indicating this is a placeholder for logging
  console.log(_stream);
  console.log(`[API CHAT] Started background response logging (placeholder)`);
  console.log(
    `[API CHAT] In production, consider using a stream tee or separate logging service`
  );
}
