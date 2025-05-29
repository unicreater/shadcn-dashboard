"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Download,
} from "lucide-react";

interface DispatchOrder {
  id: number;
  orderno: string;
  customername: string;
  customeraddress: string;
  totalcost: number;
  orderstatus: string;
  status_name: string;
  deliverydate: string;
  route_name: string;
  agent_name: string;
  total_items: number;
  picked_items: number;
  pick_status: string;
}

interface DispatchOrdersTableProps {
  orders: DispatchOrder[];
  title: string;
  day: "today" | "tomorrow";
}

export function DispatchOrdersTable({
  orders,
  title,
  day,
}: DispatchOrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders =
    orders?.filter((order) => {
      const matchesSearch =
        order.orderno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customeraddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        order.pick_status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "partial":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "ready":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Ready
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Partial
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const exportData = () => {
    const csvContent = [
      [
        "Order No",
        "Customer",
        "Address",
        "Route",
        "Status",
        "Items",
        "Picked",
        "Value",
      ].join(","),
      ...filteredOrders.map((order) =>
        [
          order.orderno,
          order.customername,
          order.customeraddress,
          order.route_name || "No Route",
          order.pick_status,
          order.total_items,
          order.picked_items,
          order.totalcost,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dispatch-orders-${day}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No orders scheduled for dispatch {day}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {title} ({filteredOrders.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers, or addresses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="ready">Ready</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderno}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customername}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {order.customeraddress}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.route_name || "No Route"}
                      </div>
                      {order.agent_name && (
                        <div className="text-xs text-muted-foreground">
                          {order.agent_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.pick_status)}
                        {getStatusBadge(order.pick_status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.picked_items}/{order.total_items} items
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            order.pick_status === "Ready"
                              ? "bg-green-500"
                              : order.pick_status === "Partial"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${
                              order.total_items > 0
                                ? (order.picked_items / order.total_items) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${order.totalcost.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(order.deliverydate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.deliverydate).toLocaleTimeString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
