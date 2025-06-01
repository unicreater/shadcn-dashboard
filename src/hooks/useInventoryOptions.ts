// hooks/useInventoryOptions.ts
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  type: string;
}

interface Lot {
  id: number;
  productid: number;
  productname: string;
  accountcode: string;
}

interface Account {
  id: number;
  code: string;
  description: string;
}

interface InventoryOptions {
  products: Product[];
  lots: Lot[];
  accounts: Account[];
}

export function useInventoryOptions() {
  const [options, setOptions] = useState<InventoryOptions>({
    products: [],
    lots: [],
    accounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/inventory/options");
      if (!response.ok) {
        throw new Error("Failed to fetch inventory options");
      }

      const data = await response.json();
      setOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching inventory options:", err);
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
