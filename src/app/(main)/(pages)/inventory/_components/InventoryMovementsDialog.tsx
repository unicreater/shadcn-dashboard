// components/InventoryMovementsDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Inventory, InventoryMovement } from "@/components/model/model";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable";
import { X, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface InventoryMovementsDialogProps {
  inventory: Inventory;
  onClose: () => void;
}

export default function InventoryMovementsDialog({
  inventory,
  onClose,
}: InventoryMovementsDialogProps) {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, [inventory.id]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/inventory/movements?inventoryId=${inventory.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      }
    } catch (error) {
      console.error("Error fetching movements:", error);
      toast.error("Failed to load inventory movements");
    } finally {
      setLoading(false);
    }
  };

  const movementColumns = [
    {
      accessorKey: "movedate",
      header: "Date",
      cell: ({ row }: any) => {
        const date = new Date(row.getValue("movedate"));
        return (
          <div>
            <div className="font-medium">{date.toLocaleDateString()}</div>
            <div className="text-sm text-muted-foreground">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "movetype",
      header: "Type",
      cell: ({ row }: any) => {
        const type = row.getValue("movetype") as string;
        const isPositive =
          !type.includes("SUBTRACT") && !type.includes("OrderPicked");

        return (
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="capitalize">
              {type.replace(/_/g, " ").toLowerCase()}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }: any) => {
        const quantity = row.getValue("quantity") as number;
        return (
          <div
            className={`font-medium ${
              quantity > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {quantity > 0 ? "+" : ""}
            {quantity.toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: "issueid",
      header: "Order ID",
      cell: ({ row }: any) => {
        const orderId = row.getValue("issueid");
        return orderId ? (
          <span className="font-mono text-sm">{orderId}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "adduser",
      header: "User",
      cell: ({ row }: any) => (
        <span className="text-sm">{row.getValue("adduser")}</span>
      ),
    },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Inventory Movements</DialogTitle>
              <div className="text-sm text-muted-foreground mt-1">
                {inventory.productname} • {inventory.brand} •{" "}
                {inventory.accountcode}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={fetchMovements}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {inventory.onhandqty}
              </div>
              <div className="text-xs text-muted-foreground">On Hand</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {inventory.allocatedqty}
              </div>
              <div className="text-xs text-muted-foreground">Allocated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {inventory.pickedqty}
              </div>
              <div className="text-xs text-muted-foreground">Picked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {inventory.onhandqty -
                  inventory.allocatedqty -
                  inventory.pickedqty}
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>

          {/* Movements Table */}
          <div className="h-96 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable
                columns={movementColumns}
                data={movements}
                searchKey="movetype"
                searchPlaceholder="Filter by movement type..."
                showSelection={false}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
