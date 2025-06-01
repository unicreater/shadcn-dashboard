// hooks/useProductOptions.ts
import { useState, useEffect } from "react";

interface ProductOptions {
  brands: string[];
  categories: string[];
  types: string[];
  categoriesByBrand: Record<string, string[]>;
}

interface UseProductOptionsReturn {
  options: ProductOptions;
  loading: boolean;
  error: string | null;
  refreshOptions: () => Promise<void>;
}

export function useProductOptions(): UseProductOptionsReturn {
  const [options, setOptions] = useState<ProductOptions>({
    brands: [],
    categories: [],
    types: [],
    categoriesByBrand: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/products/options");
      if (!response.ok) {
        throw new Error("Failed to fetch product options");
      }

      const data = await response.json();
      setOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching product options:", err);
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
