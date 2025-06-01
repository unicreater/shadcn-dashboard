"use client";

import { Order } from "@/components/model/model";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Truck,
  XCircle,
  CheckCircle,
  Clock,
  Package,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import Image from "next/image";

interface ColumnActions {
  onOrderUpdated: (orderId: string, updates: Partial<Order>) => void;
  onOrderDeleted: (orderId: string) => void;
  onOrderSelect: (order: Order) => void;
  selectedOrderId?: string;
}

// Order Status Component
function OrderStatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "10":
        return { label: "Pending", variant: "secondary", icon: Clock };
      case "30":
        return { label: "Processing", variant: "default", icon: Package };
      case "50":
        return { label: "Shipped", variant: "outline", icon: Truck };
      case "75":
        return { label: "Delivered", variant: "success", icon: CheckCircle };
      case "90":
        return { label: "Cancelled", variant: "destructive", icon: XCircle };
      default:
        return { label: "Unknown", variant: "secondary", icon: Clock };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant as any} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// Order Actions Component
function OrderActions({
  order,
  onOrderUpdated,
  onOrderDeleted,
}: {
  order: Order;
  onOrderUpdated: (orderId: string, updates: Partial<Order>) => void;
  onOrderDeleted: (orderId: string) => void;
}) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "10":
        return "30"; // Pending -> Processing
      case "30":
        return "50"; // Processing -> Shipped
      case "50":
        return "75"; // Shipped -> Delivered
      default:
        return null;
    }
  };

  const canAdvanceStatus = (status: string) => {
    return ["10", "30", "50"].includes(status);
  };

  const canCancelOrder = (status: string) => {
    return ["10", "30"].includes(status);
  };

  const handleStatusUpdate = async (targetStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      onOrderUpdated(order.id, { orderstatus: targetStatus });
      toast.success("Order Updated", {
        description: "Order status has been updated successfully.",
      });
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Update Failed", {
        description: "Failed to update order status. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setShowStatusDialog(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      onOrderDeleted(order.id);
      toast.success("Order Deleted", {
        description: "Order has been deleted successfully.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete Failed", {
        description: "Failed to delete order. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
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
            onClick={() => navigator.clipboard.writeText(order.orderno)}
          >
            Copy Order Number
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {canAdvanceStatus(order.orderstatus) && (
            <DropdownMenuItem
              onClick={() => {
                setNewStatus(getNextStatus(order.orderstatus)!);
                setShowStatusDialog(true);
              }}
            >
              <Package className="h-4 w-4 mr-2" />
              Advance Status
            </DropdownMenuItem>
          )}

          {canCancelOrder(order.orderstatus) && (
            <DropdownMenuItem
              onClick={() => {
                setNewStatus("90");
                setShowStatusDialog(true);
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Order Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update order {order.orderno} status?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleStatusUpdate(newStatus)}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Status"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order {order.orderno}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "Deleting..." : "Delete Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Function to create columns with actions
export const createOrderColumns = (
  actions: ColumnActions
): ColumnDef<Order>[] => [
  {
    accessorKey: "orderno",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order No.
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const order = row.original;
      const isSelected = actions.selectedOrderId === order.id;

      return (
        <div
          className={cn(
            "font-mono font-medium cursor-pointer hover:text-blue-600 transition-colors",
            isSelected && "text-blue-600 font-bold"
          )}
          onClick={() => actions.onOrderSelect(order)}
        >
          {row.getValue("orderno")}
        </div>
      );
    },
  },
  {
    accessorKey: "customername",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const order = row.original;
      const isSelected = actions.selectedOrderId === order.id;

      return (
        <div
          className={cn(
            "flex gap-2 items-center cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors",
            isSelected && " border border-blue-600"
          )}
          onClick={() => actions.onOrderSelect(order)}
        >
          <Image
            className="h-8 w-8 rounded-full"
            src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${row.getValue(
              "customername"
            )}`}
            alt="customer-avatar"
          />
          <div>
            <p className="font-medium">{row.getValue("customername")}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.customercontact}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "deliverydate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">{formatDate(row.getValue("deliverydate"))}</div>
    ),
  },
  {
    accessorKey: "orderstatus",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <OrderStatusBadge status={row.getValue("orderstatus")} />
    ),
  },
  {
    accessorKey: "totalcost",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("totalcost"))}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original;
      return <OrderActions order={order} {...actions} />;
    },
  },
];

// Default export for backward compatibility
export const orderColumns = createOrderColumns({
  onOrderUpdated: () => {},
  onOrderDeleted: () => {},
  onOrderSelect: () => {},
});
