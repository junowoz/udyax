import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!messages) {
    return new Response(JSON.stringify({ error: "messages missing" }), {
      status: 400,
    });
  }

  // Limita contexto para economizar tokens
  const trimmed = messages.slice(-6);

  const result = await streamText({
    model: openai("gpt-4.1-nano"),
    temperature: 0.3,
    maxTokens: 200,
    messages: trimmed,
  });

  const stream = result.toDataStream();
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
