"use client";

import { useState } from "react";
import { Order, OrderReport } from "@/components/model/model";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Upload,
  Download,
  Filter,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { createOrderColumns } from "../columns";
import OrderDetailsPanel from "./OrderDetailsPanel";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface OrderTableProps {
  data: Order[];
  weeklyProfit: {
    currentWeekTotalCost: number;
    weekPercentageChange: number;
  };
  monthlyProfit: {
    currentMonthTotalCost: number;
    monthPercentageChange: number;
  };
}

export default function OrderTable({
  data,
  weeklyProfit,
  monthlyProfit,
}: OrderTableProps) {
  const [orders, setOrders] = useState<Order[]>(sortOrders(data));
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Default sorting: Most recent first, then by status
  function sortOrders(orderData: Order[]): Order[] {
    return [...orderData].sort((a, b) => {
      // Sort by order date (most recent first)
      const dateA = new Date(a.deliveryDate).getTime();
      const dateB = new Date(b.deliveryDate).getTime();
      if (dateA !== dateB) {
        return dateB - dateA;
      }
      // Then by status priority (pending first)
      const statusPriority = { "10": 0, "30": 1, "50": 2, "75": 3, "90": 4 };
      return (
        (statusPriority[a.orderstatus as keyof typeof statusPriority] || 5) -
        (statusPriority[b.orderstatus as keyof typeof statusPriority] || 5)
      );
    });
  }

  const handleOrderUpdated = (orderId: string, updates: Partial<Order>) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, ...updates } : order
    );
    setOrders(sortOrders(updatedOrders));

    // Update selected order if it's the one being updated
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, ...updates });
    }
  };

  const handleOrderDeleted = (orderId: string) => {
    const updatedOrders = orders.filter((order) => order.id !== orderId);
    setOrders(updatedOrders);

    // Clear selected order if it's the one being deleted
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const exportToCSV = () => {
    const csvContent = [
      // Header
      "Order No,Customer Name,Customer Contact,Agent Key,Order Date,Status,Total Cost,Delivery Date",
      // Data rows
      ...filteredOrders.map(
        (order) =>
          `"${order.orderno}","${order.customername}","${
            order.customercontact
          }","${order.deliverydate}","${order.orderstatus}",${
            order.totalcost
          },"${order.deliverydate || ""}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Export Complete", {
      description: "Orders have been exported to CSV successfully.",
    });
  };

  // Filter orders based on status
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.orderstatus === statusFilter);

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderstatus === "10").length,
    processing: orders.filter((o) => o.orderstatus === "30").length,
    shipped: orders.filter((o) => o.orderstatus === "50").length,
    delivered: orders.filter((o) => o.orderstatus === "75").length,
    cancelled: orders.filter((o) => o.orderstatus === "90").length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalcost || 0), 0),
    uniqueCustomers: new Set(orders.map((o) => o.customername)).size,
  };

  // Create columns with action handlers
  const columns = createOrderColumns({
    onOrderUpdated: handleOrderUpdated,
    onOrderDeleted: handleOrderDeleted,
    onOrderSelect: handleOrderSelect,
    selectedOrderId: selectedOrder?.id,
  });

  return (
    <div className="flex gap-6 h-full">
      {/* Main Orders Section - 3/4 width */}
      <div className="flex-1 space-y-6" style={{ width: "75%" }}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">
              Manage customer orders and track order fulfillment
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="10">Pending</SelectItem>
                <SelectItem value="30">Processing</SelectItem>
                <SelectItem value="50">Shipped</SelectItem>
                <SelectItem value="75">Delivered</SelectItem>
                <SelectItem value="90">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>

            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(weeklyProfit.currentWeekTotalCost)}
                </div>
                <p className="text-xs text-muted-foreground">Weekly Revenue</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <div
              className={`text-xs mt-2 ${
                weeklyProfit.weekPercentageChange >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {weeklyProfit.weekPercentageChange >= 0 ? "+" : ""}
              {weeklyProfit.weekPercentageChange.toFixed(1)}% from last week
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(monthlyProfit.currentMonthTotalCost)}
                </div>
                <p className="text-xs text-muted-foreground">Monthly Revenue</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div
              className={`text-xs mt-2 ${
                monthlyProfit.monthPercentageChange >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {monthlyProfit.monthPercentageChange >= 0 ? "+" : ""}
              {monthlyProfit.monthPercentageChange.toFixed(1)}% from last month
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{orderStats.total}</div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {orderStats.pending} pending, {orderStats.delivered} delivered
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {orderStats.uniqueCustomers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique Customers
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Avg:{" "}
              {formatCurrency(
                orderStats.totalRevenue / orderStats.uniqueCustomers || 0
              )}{" "}
              per customer
            </div>
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-lg border p-3 text-center">
            <div className="text-lg font-bold text-yellow-600">
              {orderStats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-lg font-bold text-blue-600">
              {orderStats.processing}
            </div>
            <p className="text-xs text-muted-foreground">Processing</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-lg font-bold text-purple-600">
              {orderStats.shipped}
            </div>
            <p className="text-xs text-muted-foreground">Shipped</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-lg font-bold text-green-600">
              {orderStats.delivered}
            </div>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-lg font-bold text-red-600">
              {orderStats.cancelled}
            </div>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredOrders}
          searchKey="customername"
          searchPlaceholder="Filter orders by customer name..."
          showSelection={false}
        />
      </div>

      {/* Order Details Panel - 1/4 width */}
      <div className="w-1/4 min-w-[300px]">
        <div className="sticky top-6">
          {selectedOrder ? (
            <div className="rounded-lg border bg-card">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <OrderDetailsPanel
                order={selectedOrder}
                onOrderUpdated={handleOrderUpdated}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Order Selected</h3>
              <p className="text-sm text-muted-foreground">
                Click on an order from the table to view its details here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
