"use client";

import { useState, useCallback } from "react";
import { ChatInterface } from "./chat-interface";
import { GraphPlayground } from "./graph-playground";

interface ContextualAIChatProps {
  onQuerySent?: (query: string) => void;
}

export function ContextualAIChat({ onQuerySent }: ContextualAIChatProps) {
  const [currentQuery, setCurrentQuery] = useState<string | undefined>(
    undefined
  );

  // Handler for when a message is sent to the chat
  const handleQuerySent = useCallback(
    (query: string) => {
      setCurrentQuery(query);
      // Pass the query up to the parent component if a handler was provided
      if (onQuerySent) {
        onQuerySent(query);
      }
    },
    [onQuerySent]
  );

  return (
    <div className="flex flex-col h-full w-full space-y-4">
      <ChatInterface onQuerySent={handleQuerySent} />
      <div className="md:hidden mt-8">
        <GraphPlayground chatQuery={currentQuery} />
      </div>
    </div>
  );
}
