// components/InventoryTable.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Inventory } from "@/components/model/model";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Replace } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/DataTable";
import { createInventoryColumns } from "../columns";
import CreateInventoryDialog from "./CreateInventoryDialog";
import InventoryMovementsDialog from "./InventoryMovementsDialog";
import UploadInventoryDialog from "./UploadInventoryDialog";
import { toast } from "sonner";

interface InventoryTableProps {
  data: Inventory[]; // This is the filtered data for display
  setData?: (data: Inventory[]) => void; // Updates the full dataset
  allData?: Inventory[]; // The complete unfiltered dataset
}

export default function InventoryTable({
  data,
  setData,
  allData = data,
}: InventoryTableProps) {
  const [inventory, setInventory] = useState<Inventory[]>(sortInventory(data));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInventoryForMovements, setSelectedInventoryForMovements] =
    useState<Inventory | null>(null);
  const [excelUploadOpen, setExcelUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"add" | "replace">("add");

  function sortInventory(inventoryData: Inventory[]): Inventory[] {
    return [...inventoryData].sort((a, b) => {
      // Sort by available quantity (low stock first for attention)
      const aAvailable = a.onhandqty - a.allocatedqty - a.pickedqty;
      const bAvailable = b.onhandqty - b.allocatedqty - b.pickedqty;

      if (aAvailable !== bAvailable) {
        return aAvailable - bAvailable; // Low stock first
      }

      // Then by product name
      return a.productname.localeCompare(b.productname);
    });
  }

  // Update local state when props change
  useEffect(() => {
    setInventory(sortInventory(data));
  }, [data]);

  const handleInventoryCreated = useCallback(
    (newInventory: Inventory) => {
      if (setData) {
        const updatedInventory = [...allData, newInventory];
        const sortedInventory = sortInventory(updatedInventory);
        setData(sortedInventory);
      }
      setIsCreateOpen(false);
      toast.success("Inventory Created", {
        description: `Inventory record for ${newInventory.productname} has been created.`,
      });
    },
    [allData, setData]
  );

  const handleInventoryAdjusted = useCallback(
    async (inventoryId: string) => {
      try {
        // Show immediate feedback
        toast.success("Inventory Updated", {
          description: "Inventory has been adjusted successfully.",
        });

        // Fetch fresh data from the API
        const response = await fetch("/api/inventory");
        if (response.ok) {
          const freshData = await response.json();
          if (setData) {
            setData(sortInventory(freshData));
          }
        } else {
          throw new Error("Failed to fetch updated inventory");
        }
      } catch (error) {
        console.error("Error refreshing inventory:", error);
        toast.error("Update Failed", {
          description:
            "Failed to refresh inventory data. Please refresh the page.",
        });
      }
    },
    [setData]
  );

  const handleViewMovements = useCallback((inventoryRecord: Inventory) => {
    setSelectedInventoryForMovements(inventoryRecord);
  }, []);

  const handleExcelUpload = useCallback((type: "add" | "replace") => {
    setUploadType(type);
    setExcelUploadOpen(true);
  }, []);

  const handleExcelUploadComplete = useCallback(
    (updatedInventory: Inventory[]) => {
      if (setData) {
        setData(sortInventory(updatedInventory));
      }
      setExcelUploadOpen(false);
    },
    [setData]
  );

  const exportToCSV = useCallback(() => {
    const csvContent = [
      // Header
      "Product,Brand,Category,Location,OnHand,Allocated,Picked,Available",
      // Data rows - use all data, not just filtered
      ...allData.map((i) => {
        const available = i.onhandqty - i.allocatedqty - i.pickedqty;
        return `"${i.productname}","${i.brand}","${i.category}","${i.accountcode}",${i.onhandqty},${i.allocatedqty},${i.pickedqty},${available}`;
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Export Complete", {
      description: "Inventory has been exported to CSV successfully.",
    });
  }, [allData]);

  const columns = createInventoryColumns({
    onInventoryAdjusted: handleInventoryAdjusted,
    onViewMovements: handleViewMovements,
  });

  // Calculate summary statistics from all data, not filtered data
  const totalProducts = new Set(allData.map((i) => i.productid)).size;
  const totalOnHand = allData.reduce((sum, i) => sum + i.onhandqty, 0);
  const totalAllocated = allData.reduce((sum, i) => sum + i.allocatedqty, 0);
  const totalAvailable = allData.reduce(
    (sum, i) => sum + (i.onhandqty - i.allocatedqty - i.pickedqty),
    0
  );
  const lowStockCount = allData.filter(
    (i) => i.onhandqty - i.allocatedqty - i.pickedqty <= 10
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h2>
          <p className="text-muted-foreground">
            Track stock levels, movements, and adjustments
            {data.length !== allData.length && (
              <span className="ml-2 text-blue-600">
                (Showing {data.length} of {allData.length} items)
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          {/* Excel Upload Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Excel Upload
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Upload Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleExcelUpload("add")}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2 text-blue-600" />
                <div>
                  <div className="font-medium">Add Quantities</div>
                  <div className="text-xs text-muted-foreground">
                    Excel + Current = New Total
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExcelUpload("replace")}
                className="cursor-pointer"
              >
                <Replace className="h-4 w-4 mr-2 text-orange-600" />
                <div>
                  <div className="font-medium">Replace Quantities</div>
                  <div className="text-xs text-muted-foreground">
                    Excel = New Total
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Inventory
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <CreateInventoryDialog
                onInventoryCreated={handleInventoryCreated}
                onClose={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">Products Tracked</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">
            {totalOnHand.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Total On Hand</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold text-orange-600">
            {totalAllocated.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Total Allocated</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {totalAvailable.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Total Available</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
          <p className="text-xs text-muted-foreground">Low Stock Items</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <h3 className="font-medium text-red-900">Low Stock Alert</h3>
          </div>
          <p className="text-red-700 text-sm mt-1">
            {lowStockCount} item(s) have 10 or fewer units available. Consider
            restocking soon.
          </p>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={inventory}
        searchKey="productname"
        searchPlaceholder="Filter by product name..."
        showSelection={true}
      />

      {/* Dialogs */}
      {selectedInventoryForMovements && (
        <InventoryMovementsDialog
          inventory={selectedInventoryForMovements}
          onClose={() => setSelectedInventoryForMovements(null)}
        />
      )}

      <UploadInventoryDialog
        isOpen={excelUploadOpen}
        onClose={() => setExcelUploadOpen(false)}
        uploadType={uploadType}
        onUploadComplete={handleExcelUploadComplete}
      />
    </div>
  );
}
