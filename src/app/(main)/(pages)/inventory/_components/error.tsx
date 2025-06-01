// app/inventory/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function InventoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Inventory page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:px-14">
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground">
                Failed to load inventory data. This could be due to a network
                issue or server error.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {error.message}
                  {error.stack && "\n\n" + error.stack}
                </pre>
              </details>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
