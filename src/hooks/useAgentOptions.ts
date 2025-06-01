// hooks/useAgentOptions.ts
import { useState, useEffect } from "react";

interface AgentPolicy {
  id: number;
  code: string;
  description: string;
}

interface AgentOptions {
  agentPolicies: AgentPolicy[];
  types: string[];
}

interface UseAgentOptionsReturn {
  options: AgentOptions;
  loading: boolean;
  error: string | null;
  refreshOptions: () => Promise<void>;
}

export function useAgentOptions(): UseAgentOptionsReturn {
  const [options, setOptions] = useState<AgentOptions>({
    agentPolicies: [],
    types: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/agents/options");
      if (!response.ok) {
        throw new Error("Failed to fetch agent options");
      }

      const data = await response.json();
      setOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching agent options:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return {
    options,
    loading,
    error,
    refreshOptions: fetchOptions,
  };
}
