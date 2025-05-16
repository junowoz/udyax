"use client";

import { useState, useCallback } from "react";
import { ChatInterface } from "./chat-interface";
import { GraphPlayground } from "./graph-playground";

interface ContextualAIChatProps {
  onQueryChange?: (query: string) => void;
}

export function ContextualAIChat({ onQueryChange }: ContextualAIChatProps) {
  const [query, setQuery] = useState<string | undefined>();

  const handleQuery = useCallback(
    (q: string) => {
      setQuery(q);
      if (onQueryChange) onQueryChange(q);
    },
    [onQueryChange]
  );

  return (
    <div className="flex flex-col space-y-8">
      <ChatInterface onQuerySent={handleQuery} />
      {/* no desktop o GraphPlayground é renderizado fora;
          em mobile trazemos aqui embaixo */}
      <div className="md:hidden">
        <GraphPlayground chatQuery={query} />
      </div>
    </div>
  );
}
