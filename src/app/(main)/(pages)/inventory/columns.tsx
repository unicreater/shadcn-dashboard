// components/inventory-columns.tsx
"use client";

import { Inventory } from "@/components/model/model";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  TrendingUp,
  TrendingDown,
  History,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ColumnActions {
  onInventoryAdjusted: (inventoryId: string) => void;
  onViewMovements: (inventory: Inventory) => void;
}

function InventoryActions({
  inventory,
  onInventoryAdjusted,
  onViewMovements,
}: {
  inventory: Inventory;
  onInventoryAdjusted: (inventoryId: string) => void;
  onViewMovements: (inventory: Inventory) => void;
}) {
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<
    "ADD" | "SUBTRACT" | "SET"
  >("ADD");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdjustment = async () => {
    if (!quantity || !reason) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/inventory/${inventory.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adjustmentType,
          quantity: Number(quantity),
          reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to adjust inventory");
      }

      onInventoryAdjusted(inventory.id);
      setShowAdjustDialog(false);
      setQuantity("");
      setReason("");

      toast.success("Inventory Adjusted", {
        description: `${adjustmentType.toLowerCase()} ${quantity} units successfully.`,
      });
    } catch (error) {
      console.error("Adjustment error:", error);
      toast.error("Adjustment Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to adjust inventory.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(inventory.id)}
          >
            Copy Inventory ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowAdjustDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Adjust Quantity
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewMovements(inventory)}>
            <History className="h-4 w-4 mr-2" />
            View Movements
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adjust Inventory</AlertDialogTitle>
            <AlertDialogDescription>
              Current on-hand quantity: {inventory.onhandqty}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Adjustment Type</label>
              <select
                className="w-full p-2 border rounded"
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value as any)}
              >
                <option value="ADD">Add Quantity</option>
                <option value="SUBTRACT">Subtract Quantity</option>
                <option value="SET">Set Quantity</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <input
                type="number"
                min="0"
                className="w-full p-2 border rounded"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <textarea
                className="w-full p-2 border rounded"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for adjustment"
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAdjustment} disabled={isLoading}>
              {isLoading ? "Adjusting..." : "Adjust Inventory"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const createInventoryColumns = (
  actions: ColumnActions
): ColumnDef<Inventory>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "productname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0 justify-start"
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("productname")}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.brand} • {row.original.category}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "accountcode",
    header: "Location",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("accountcode")}</div>
    ),
  },
  {
    accessorKey: "onhandqty",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0 justify-start"
        >
          On Hand
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const qty = row.getValue("onhandqty") as number;
      return (
        <div
          className={`font-medium ${
            qty <= 10
              ? "text-red-600"
              : qty <= 50
              ? "text-orange-600"
              : "text-green-600"
          }`}
        >
          {qty.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "allocatedqty",
    header: "Allocated",
    cell: ({ row }) => {
      const qty = row.getValue("allocatedqty") as number;
      return (
        <div className="font-medium text-orange-600">
          {qty.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "pickedqty",
    header: "Picked",
    cell: ({ row }) => {
      const qty = row.getValue("pickedqty") as number;
      return (
        <div className="font-medium text-blue-600">{qty.toLocaleString()}</div>
      );
    },
  },
  {
    accessorKey: "availableqty",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0 justify-start"
        >
          Available
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const qty =
        row.original.onhandqty -
        row.original.allocatedqty -
        row.original.pickedqty;
      return (
        <div
          className={`font-medium ${
            qty <= 0
              ? "text-red-600"
              : qty <= 10
              ? "text-orange-600"
              : "text-green-600"
          }`}
        >
          {qty.toLocaleString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const inventory = row.original;
      return <InventoryActions inventory={inventory} {...actions} />;
    },
  },
];
