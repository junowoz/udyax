"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageCircle, Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// Defina um tipo para os itens de dados em cada escopo
interface ResponseDataItem {
  [key: string]: string | number;
}

interface ChatResponse {
  success: boolean;
  query: string;
  scope: "promessometro" | "votacoes" | "licitacoes" | "gastos";
  timestamp: string;
  data: ResponseDataItem[];
  message: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Olá! Como posso ajudar você a encontrar dados de transparência pública hoje?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeScope, setActiveScope] = useState<
    "promessometro" | "votacoes" | "licitacoes" | "gastos"
  >("promessometro");

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // In a real app, this would be a fetch to the actual API
      // const response = await fetch("/api/ask", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ scope: activeScope, query: inputValue }),
      // });
      // const data: ChatResponse = await response.json();

      // Mock API response for demo
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResponse: ChatResponse = {
        success: true,
        query: inputValue,
        scope: activeScope,
        timestamp: new Date().toISOString(),
        data: [],
        message: "",
      };

      // Different mock response based on scope
      switch (activeScope) {
        case "promessometro":
          mockResponse.message = "Encontrei estes dados no Promessômetro:";
          mockResponse.data = [
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
          ];
          break;
        case "votacoes":
          mockResponse.message = "Dados de votações recentes:";
          mockResponse.data = [
            {
              politico: "Eduardo Braga",
              sessao: "PL 123/2023",
              voto: "Favorável",
            },
            { politico: "Omar Aziz", sessao: "PL 123/2023", voto: "Contrário" },
          ];
          break;
        case "licitacoes":
          mockResponse.message = "Licitações encontradas:";
          mockResponse.data = [
            {
              numero: "2023-045",
              objeto: "Pavimentação",
              valor: "R$ 5.400.000",
            },
            {
              numero: "2023-037",
              objeto: "Revitalização do Porto",
              valor: "R$ 12.800.000",
            },
          ];
          break;
        case "gastos":
          mockResponse.message = "Dados de gastos públicos:";
          mockResponse.data = [
            {
              secretaria: "Saúde",
              ano: "2023",
              orcamento: "R$ 1.2B",
              executado: "R$ 980M",
            },
            {
              secretaria: "Educação",
              ano: "2023",
              orcamento: "R$ 800M",
              executado: "R$ 750M",
            },
          ];
          break;
      }

      // Format response for display
      let responseText = mockResponse.message + "\n\n";
      mockResponse.data.forEach((item) => {
        const entries = Object.entries(item);
        entries.forEach(([key, value]) => {
          responseText += `${key}: ${value}\n`;
        });
        responseText += "\n";
      });

      // Add bot response
      const botMessage: Message = {
        id: generateId(),
        text: responseText.trim(),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: Message = {
        id: generateId(),
        text: "Desculpe, houve um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScopeChange = (
    scope: "promessometro" | "votacoes" | "licitacoes" | "gastos"
  ) => {
    setActiveScope(scope);
    const scopeMessage: Message = {
      id: generateId(),
      text: `Modo alterado para: ${scope}`,
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, scopeMessage]);
  };

  return (
    <div id="chat-section" className="fixed bottom-6 right-6 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Abrir chat</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] h-[600px] flex flex-col p-0">
          <DialogHeader className="px-4 py-2 border-b">
            <DialogTitle>Chat UDYAX</DialogTitle>
            <DialogDescription>
              Pergunte sobre dados de transparência pública
            </DialogDescription>
          </DialogHeader>

          {/* Scope buttons */}
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 border-b">
            {["promessometro", "votacoes", "licitacoes", "gastos"].map(
              (scope) => (
                <Button
                  key={scope}
                  variant={activeScope === scope ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    handleScopeChange(
                      scope as
                        | "promessometro"
                        | "votacoes"
                        | "licitacoes"
                        | "gastos"
                    )
                  }
                >
                  {scope.charAt(0).toUpperCase() + scope.slice(1)}
                </Button>
              )
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-line text-sm">
                    {message.text}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="p-3 border-t bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Perguntar sobre ${activeScope}...`}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
