"use client";

import { useState, useRef, useEffect } from "react";
import { useChat, type Message } from "ai/react";
import { Avatar, AvatarFallback } from "./avatar";
import { Badge } from "./badge";
import { Button } from "./button";
import { ClipboardList, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Vote icon
const VoteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 16.36 2 13.25 2 9.5 2 6.42 4.42 4 7.5 4c1.74 0 3.41.81 4.5 2.09C13.09 4.81 14.76 4 16.5 4 19.58 4 22 6.42 22 9.5c0 3.75-3.4 6.86-8.55 10.54L12 21.35z" />
  </svg>
);

interface ChatInterfaceProps {
  onQuerySent?: (query: string) => void;
}

export function ChatInterface({ onQuerySent }: ChatInterfaceProps) {
  const [topic, setTopic] = useState<string | null>(null);
  const [hasAnalyzedQuery, setHasAnalyzedQuery] = useState(false);

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
                   Prefira dados de APIs oficiais sempre que possível.`,
        },
      ],
      onFinish: (message) => {
        // When we get a response, check if we need to notify parent about the query
        if (!hasAnalyzedQuery) {
          const userMessages = messages.filter((m) => m.role === "user");
          if (userMessages.length > 0 && onQuerySent) {
            const lastUserMessage =
              userMessages[userMessages.length - 1].content;
            console.log("Processing query for visualization:", lastUserMessage);
            console.log("Response message:", message);
            onQuerySent(lastUserMessage);
            setHasAnalyzedQuery(true);
          }
        }
      },
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset the analyzed state when a new query is started
  useEffect(() => {
    if (input.trim() === "") {
      setHasAnalyzedQuery(false);
    }
  }, [input]);

  // Custom submit handler to trigger the query sent callback
  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (onQuerySent && input.trim()) {
      console.log("Sending query for analysis:", input.trim());
      onQuerySent(input.trim());
      setHasAnalyzedQuery(true);
    }
    handleSubmit(e);
  };

  // Function to set the topic of the conversation
  const handleSetTopic = (newTopic: string) => {
    setTopic(newTopic);
    const topicPrompts = {
      promessas:
        "Quais são as principais promessas feitas por políticos no Brasil e o status de execução delas?",
      gastos:
        "Qual é o detalhamento dos gastos públicos do governo federal, especialmente por área (saúde, educação, etc)?",
      votos:
        "Quais foram as principais votações e projetos de lei recentes no congresso nacional?",
    };

    // Special queries for demos
    const demoQueries = {
      promessas:
        "Quais são as principais promessas feitas por políticos no Brasil e o status de execução delas?",
      gastos: "Quais deputados mais gastaram com a cota parlamentar em 2023?",
      votos:
        "Quais foram as principais votações e projetos de lei recentes no congresso nacional?",
    };

    // Use the demo queries instead of general ones
    const queryToUse =
      newTopic in demoQueries
        ? demoQueries[newTopic as keyof typeof demoQueries]
        : topicPrompts[newTopic as keyof typeof topicPrompts];

    // Simulate user input based on the selected topic
    if (queryToUse) {
      setHasAnalyzedQuery(false); // Reset for new query
      const submitEvent = new Event("submit", { cancelable: true });

      // Fill the input with the topic-related question
      const inputElement = document.querySelector(
        'input[name="message"]'
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = queryToUse;
        handleInputChange({
          target: inputElement,
        } as React.ChangeEvent<HTMLInputElement>);

        // Trigger form submission
        setTimeout(() => {
          const formElement = inputElement.closest("form");
          if (formElement) {
            // Call onQuerySent with the prompt
            if (onQuerySent) {
              console.log("Topic button sending query:", queryToUse);
              onQuerySent(queryToUse);
              setHasAnalyzedQuery(true);
            }
            formElement.dispatchEvent(submitEvent);
          }
        }, 100);
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh] w-full rounded-xl border bg-background shadow-xl overflow-hidden">
      <header className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Dados Governamentais</h2>
        <div className="flex items-center gap-2">
          {topic && (
            <Badge variant="secondary" className="capitalize">
              {topic}
            </Badge>
          )}
        </div>
      </header>

      {messages.length === 0 && !isLoading && (
        <div className="py-8 flex flex-col items-center justify-center space-y-6">
          <p className="text-center text-muted-foreground max-w-md mx-auto">
            Selecione um tópico abaixo para começar ou faça uma pergunta
            específica sobre dados governamentais e políticos brasileiros.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md mx-auto px-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 justify-start py-6"
              onClick={() => handleSetTopic("promessas")}
            >
              <ClipboardList className="h-5 w-5" />
              <span>Promessas</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 justify-start py-6"
              onClick={() => handleSetTopic("gastos")}
            >
              <DollarSign className="h-5 w-5" />
              <span>Gastos</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 justify-start py-6"
              onClick={() => handleSetTopic("votos")}
            >
              <VoteIcon className="h-5 w-5" />
              <span>Votações</span>
            </Button>
          </div>
        </div>
      )}

      <div className="flex-grow p-4 space-y-4">
        {messages
          .filter((m) => m.role !== "system")
          .map((m: Message) => (
            <div
              key={m.id}
              className={cn(
                "flex items-start gap-3 rounded-lg p-3 text-sm",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {m.role === "assistant" && (
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback className="bg-blue-600 text-white">
                    AI
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[75%] whitespace-pre-wrap rounded-md px-3 py-2",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback className="bg-zinc-200">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="p-4 text-sm text-red-500 border-t bg-red-50">
          <strong>Erro:</strong>{" "}
          {error.message || "Ocorreu um problema ao processar sua solicitação."}
        </div>
      )}

      <div className="border-t p-4">
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            name="message"
            className="flex-1 min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={input}
            onChange={handleInputChange}
            placeholder="Pergunte sobre dados governamentais brasileiros..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}
