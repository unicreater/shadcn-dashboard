// app/inventory/page.tsx
import { Suspense } from "react";
import { Inventory } from "@/components/model/model";
import { fetchAllInventoryFromDb } from "@/utils/databaseUtils";
import InventoryPageClient from "./_components/InventoryPageClient";
import { Skeleton } from "@/components/ui/skeleton";

// Force dynamic rendering to ensure consistent behavior between navigation and reload
export const dynamic = "force-dynamic";
export const revalidate = 0;

// This ensures the page always goes through the loading state
async function InventoryDataLoader() {
  try {
    const data: Inventory[] = await fetchAllInventoryFromDb();
    return <InventoryPageClient initialData={data} />;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error; // Let error boundary handle this
  }
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<InventoryLoadingSkeleton />}>
      <InventoryDataLoader />
    </Suspense>
  );
}

function InventoryLoadingSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:px-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center gap-4 w-full">
            {/* Breadcrumb skeleton */}
            <div className="hidden md:flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <span>/</span>
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Search skeleton */}
            <div className="ml-auto">
              <Skeleton className="h-9 w-64" />
            </div>

            {/* Avatar skeleton */}
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </header>

        <main className="flex-1 space-y-4 p-4 pt-6">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>

            {/* Table skeleton */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-80" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="border rounded-lg">
                <div className="p-4">
                  <Skeleton className="h-12 w-full mb-2" />
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full mb-1" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
