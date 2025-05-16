"use client";

import { useState, useRef, useEffect } from "react";
import { useChat, type Message } from "ai/react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Sparkles, SendHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Example suggestions that appear at the start of the conversation
const SUGGESTIONS = [
  {
    title: "Gastos parlamentares",
    examples: [
      "Quais deputados mais gastaram com a cota parlamentar em 2023?",
      "Qual o gasto médio dos deputados com passagens aéreas?",
      "Quais os maiores gastos do Congresso Nacional nos últimos anos?",
    ],
  },
  {
    title: "Projetos de Lei",
    examples: [
      "Quantos projetos de lei foram apresentados este ano?",
      "Quais são os status dos projetos de lei sobre educação?",
      "Qual a porcentagem de projetos de lei aprovados sobre meio ambiente?",
    ],
  },
  {
    title: "Transparência",
    examples: [
      "Como funciona o Portal da Transparência?",
      "Quais informações estão disponíveis no Portal da Câmara?",
      "Explique como acessar os dados de gastos públicos do governo federal",
    ],
  },
];

interface ChatInterfaceProps {
  onQuerySent?: (query: string) => void;
}

export function ChatInterface({ onQuerySent }: ChatInterfaceProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasAnalyzedQuery, setHasAnalyzedQuery] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      initialMessages: [
        {
          id: "system-1",
          role: "system",
          content: `Você é um assistente especializado em dados governamentais brasileiros.
                   Responda APENAS perguntas relacionadas a dados do governo, promessas políticas, gastos públicos,
                   votações e projetos de lei. Se perguntarem sobre qualquer outro tópico, recuse
                   educadamente e explique que seu escopo é limitado a dados públicos do governo brasileiro.
                   Prefira dados de APIs oficiais sempre que possível.
                   
                   Se o usuário perguntar sobre gastos ou despesas, mencione que você vai gerar uma visualização dos dados.
                   Se o usuário perguntar sobre projetos de lei, mencione que está analisando os dados da API da Câmara.`,
        },
      ],
      onFinish: () => {
        // When we get a response, check if we need to notify parent about the query
        if (!hasAnalyzedQuery) {
          const userMessages = messages.filter((m) => m.role === "user");
          if (userMessages.length > 0 && onQuerySent) {
            const lastUserMessage =
              userMessages[userMessages.length - 1].content;
            console.log("Processing query for visualization:", lastUserMessage);
            onQuerySent(lastUserMessage);
            setHasAnalyzedQuery(true);
          }
        }
      },
    });

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Hide suggestions when first message is sent
  useEffect(() => {
    if (messages.filter((m) => m.role === "user").length > 0) {
      setShowSuggestions(false);
    }
  }, [messages]);

  // Reset the analyzed state when a new query is started
  useEffect(() => {
    if (input.trim() === "") {
      setHasAnalyzedQuery(false);
    }
  }, [input]);

  // Custom submit handler to trigger the query sent callback
  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (onQuerySent) {
      console.log("Sending query for analysis:", input.trim());
      onQuerySent(input.trim());
      setHasAnalyzedQuery(true);
    }
    handleSubmit(e);
    setShowSuggestions(false);
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (text: string) => {
    if (inputRef.current) {
      inputRef.current.value = text;
      const event = {
        target: inputRef.current,
      } as React.ChangeEvent<HTMLTextAreaElement>;
      handleInputChange(event);

      // Focus the input after setting the suggestion
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl overflow-hidden">
      <header className="px-4 py-3 border-b border-zinc-700 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-medium text-zinc-100">
          Assistente de Dados Governamentais
        </h2>
      </header>

      <div
        className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800"
        style={{ maxHeight: "calc(600px - 120px)" }}
      >
        {messages.length === 0 && showSuggestions ? (
          <div className="flex flex-col space-y-8 pt-4">
            <p className="text-center text-zinc-400">
              Olá! Sou o assistente de dados governamentais. Como posso ajudar
              você hoje?
            </p>

            {SUGGESTIONS.map((category, i) => (
              <div key={i} className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-400">
                  {category.title}
                </h3>
                <div className="grid gap-2">
                  {category.examples.map((example, j) => (
                    <Button
                      key={j}
                      variant="outline"
                      className="justify-start h-auto py-3 px-4 whitespace-normal text-left border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                      onClick={() => handleSuggestionClick(example)}
                    >
                      {`"${example}"`}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {messages
              .filter((m) => m.role !== "system")
              .map((m: Message) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex items-start gap-3",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {m.role === "assistant" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-emerald-600 text-white font-medium">
                        IA
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] text-sm whitespace-pre-wrap rounded-lg px-4 py-3",
                      m.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-700 text-zinc-100"
                    )}
                  >
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        U
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
          </>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 text-sm text-red-400 border-t border-zinc-700 bg-red-500/10">
          <strong>Erro:</strong>{" "}
          {error.message || "Ocorreu um problema ao processar sua solicitação."}
        </div>
      )}

      <div className="border-t border-zinc-700 p-4">
        <form
          ref={formRef}
          onSubmit={handleCustomSubmit}
          className="flex gap-3 items-center"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              name="message"
              rows={1}
              className="w-full resize-none rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-3 text-sm text-zinc-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px] max-h-[200px] pr-10 placeholder-zinc-400"
              value={input}
              onChange={handleInputChange}
              placeholder="Envie uma mensagem"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (formRef.current && !isLoading && input.trim()) {
                    formRef.current.requestSubmit();
                  }
                }
              }}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-[44px] w-[44px] rounded-full flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-zinc-600"
          >
            <SendHorizontal className="h-5 w-5" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
        <p className="text-xs text-zinc-400 mt-2 text-center">
          As respostas são baseadas em dados oficiais do governo brasileiro.
        </p>
      </div>
    </div>
  );
}
