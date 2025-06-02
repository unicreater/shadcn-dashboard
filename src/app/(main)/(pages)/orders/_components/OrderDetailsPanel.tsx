"use client";

import { useState, useEffect } from "react";
import { Order } from "@/components/model/model";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  MapPin,
  Phone,
  Calendar,
  Package,
  Truck,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

interface OrderDetailsPanelProps {
  order: Order;
  onOrderUpdated: (orderId: string, updates: Partial<Order>) => void;
}

interface OrderDetails {
  items: Array<{
    id: string;
    productname: string;
    brand: string;
    category: string;
    expectedqty: number;
    salesprice: number;
  }>;
  agentcode?: string;
  routedescription?: string;
}

export default function OrderDetailsPanel({
  order,
  onOrderUpdated,
}: OrderDetailsPanelProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [order.id]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`);
      if (response.ok) {
        const details = await response.json();
        setOrderDetails(details);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "10":
        return {
          label: "Pending",
          variant: "secondary",
          icon: Clock,
          color: "text-yellow-600",
        };
      case "30":
        return {
          label: "Processing",
          variant: "default",
          icon: Package,
          color: "text-blue-600",
        };
      case "50":
        return {
          label: "Shipped",
          variant: "outline",
          icon: Truck,
          color: "text-purple-600",
        };
      case "75":
        return {
          label: "Delivered",
          variant: "success",
          icon: CheckCircle,
          color: "text-green-600",
        };
      case "90":
        return {
          label: "Cancelled",
          variant: "destructive",
          icon: XCircle,
          color: "text-red-600",
        };
      default:
        return {
          label: "Unknown",
          variant: "secondary",
          icon: Clock,
          color: "text-gray-600",
        };
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "10":
        return { status: "30", label: "Mark as Processing" };
      case "30":
        return { status: "50", label: "Mark as Shipped" };
      case "50":
        return { status: "75", label: "Mark as Delivered" };
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

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      onOrderUpdated(order.id, { orderstatus: newStatus });
      toast.success("Order Updated", {
        description: "Order status has been updated successfully.",
      });
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Update Failed", {
        description: "Failed to update order status. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const statusConfig = getStatusConfig(order.orderstatus);
  const StatusIcon = statusConfig.icon;
  const nextStatus = getNextStatus(order.orderstatus);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Order Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
          <Badge variant={statusConfig.variant as any}>
            {statusConfig.label}
          </Badge>
        </div>
        <h4 className="font-mono text-lg font-semibold">{order.orderno}</h4>
        <p className="text-sm text-muted-foreground">
          Order placed on {formatDate(order.deliverydate!)}
        </p>
      </div>

      <Separator />

      {/* Customer Information */}
      <div className="space-y-3">
        <h5 className="font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          Customer Details
        </h5>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Image
              className="h-8 w-8 rounded-full"
              src="/fuzzieLogo.png"
              alt="customer-avatar"
            />
            <div>
              <p className="font-medium">{order.customername}</p>
              <p className="text-xs text-muted-foreground">Customer</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{order.customercontact}</span>
          </div>

          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5" />
            <span className="text-xs leading-relaxed">
              {order.customeraddress}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Order Information */}
      <div className="space-y-3">
        <h5 className="font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          Order Information
        </h5>
        <div className="space-y-2 text-sm">
          {/* <div className="flex justify-between">
            <span className="text-muted-foreground">Agent Key:</span>
            <span className="font-mono text-xs">{order.agentkey}</span>
          </div> */}

          {orderDetails?.agentcode && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Agent:</span>
              <span>{orderDetails.agentcode}</span>
            </div>
          )}

          {orderDetails?.routedescription && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route:</span>
              <span>{orderDetails.routedescription}</span>
            </div>
          )}

          {order.deliverydate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery:</span>
              <span>{formatDate(order.deliverydate)}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Order Items */}
      {orderDetails?.items && orderDetails.items.length > 0 && (
        <>
          <div className="space-y-3">
            <h5 className="font-medium">
              Order Items ({orderDetails.items.length})
            </h5>
            <div className="space-y-2">
              {orderDetails.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start p-2 rounded border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productname}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.brand} • {item.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.expectedqty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatCurrency(item.salesprice * item.expectedqty)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.salesprice)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Order Total */}
      <div className="space-y-3">
        <h5 className="font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Order Total
        </h5>
        <div className="bg-muted/50 p-3 rounded">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-lg font-bold">
              {formatCurrency(order.totalcost || 0)}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-2">
        {canAdvanceStatus(order.orderstatus) && nextStatus && (
          <Button
            className="w-full"
            onClick={() => handleStatusUpdate(nextStatus.status)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Package className="h-4 w-4 mr-2" />
            )}
            {nextStatus.label}
          </Button>
        )}

        {canCancelOrder(order.orderstatus) && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleStatusUpdate("90")}
            disabled={isUpdating}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel Order
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={fetchOrderDetails}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Details
        </Button>
      </div>
    </div>
  );
}
