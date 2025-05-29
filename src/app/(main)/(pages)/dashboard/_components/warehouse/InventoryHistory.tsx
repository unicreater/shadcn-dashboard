"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Package, TrendingUp, Upload } from "lucide-react";

// Types matching your database schema
interface InventoryMovement {
  id: number;
  movetype: string;
  quantity: number;
  movedate: string;
  product_name: string;
  adduser: string;
  lot_code?: string;
  current_stock?: number;
  brand?: string;
  category?: string;
}

interface MovementSummary {
  date: string;
  date_label: string;
  uploads: number;
  picks: number;
  adjustments: number;
  total_movements: number;
}

interface InventoryHistoryProps {
  productId?: number;
  height?: number;
  showFilters?: boolean;
  initialData?: {
    movements: InventoryMovement[];
    summary: MovementSummary[];
  };
}

export function InventoryHistory({
  productId,
  height = 400,
  showFilters = true,
  initialData,
}: InventoryHistoryProps) {
  const [movements, setMovements] = useState<InventoryMovement[]>(
    initialData?.movements || []
  );
  const [summary, setSummary] = useState<MovementSummary[]>(
    initialData?.summary || []
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(30);

  // Only fetch data if not provided via props
  useEffect(() => {
    if (!initialData) {
      fetchInventoryHistory();
    }
  }, [productId, dateRange, initialData]);

  const fetchInventoryHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // This would be called from a server component or page
      // For now, we'll assume the data is passed via props
      console.log("Data should be fetched server-side and passed as props");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error fetching inventory history:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMoveTypeIcon = (moveType: string) => {
    switch (moveType) {
      case "InventoryUpload":
        return <Upload className="h-4 w-4 text-green-500" />;
      case "InventoryIncrease":
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "InventoryDecrease":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      case "OrderPicked":
        return <Package className="h-4 w-4 text-orange-500" />;
      case "OrderReverted":
        return <Package className="h-4 w-4 text-purple-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMoveTypeColor = (moveType: string) => {
    switch (moveType) {
      case "InventoryUpload":
        return "text-green-600";
      case "InventoryIncrease":
        return "text-blue-600";
      case "InventoryDecrease":
        return "text-red-600";
      case "OrderPicked":
        return "text-orange-600";
      case "OrderReverted":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const exportData = () => {
    const csvContent = [
      [
        "Date",
        "Type",
        "Product",
        "Brand",
        "Category",
        "Quantity",
        "User",
        "Lot Code",
      ].join(","),
      ...movements.map((m) =>
        [
          new Date(m.movedate).toLocaleString(),
          m.movetype,
          m.product_name,
          m.brand || "",
          m.category || "",
          m.quantity,
          m.adduser,
          m.lot_code || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-history-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="bg-destructive/10 border-destructive/20 border p-4 rounded-md">
            <h3 className="text-destructive font-semibold mb-2">
              Error Loading Inventory History
            </h3>
            <p className="text-destructive/80 mb-4">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInventoryHistory}
              className="border-destructive/20 hover:bg-destructive/10"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [...summary].reverse().map((item) => ({
    ...item,
    uploads: Number(item.uploads) || 0,
    picks: Number(item.picks) || 0,
    adjustments: Number(item.adjustments) || 0,
    total_movements: Number(item.total_movements) || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {productId
              ? "Product Inventory History"
              : "Inventory Movement History"}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Loading inventory data...
          </div>
        ) : movements.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No inventory movements found</p>
              <p className="text-sm mt-2">
                Movements will appear when inventory is uploaded or modified
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="chart" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Chart View
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Detail View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={height}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date_label"
                      tick={{
                        fontSize: 12,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="uploads"
                      stackId="movements"
                      fill="hsl(142 76% 36%)"
                      name="Uploads"
                    />
                    <Bar
                      dataKey="picks"
                      stackId="movements"
                      fill="hsl(24 95% 53%)"
                      name="Picks"
                    />
                    <Bar
                      dataKey="adjustments"
                      stackId="movements"
                      fill="hsl(220 70% 50%)"
                      name="Adjustments"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No chart data available for the selected period
                </div>
              )}
            </TabsContent>

            <TabsContent value="table">
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        {productId && <TableHead>Current Stock</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMoveTypeIcon(movement.movetype)}
                              <span
                                className={`text-sm font-medium ${getMoveTypeColor(
                                  movement.movetype
                                )}`}
                              >
                                {movement.movetype
                                  .replace(/([A-Z])/g, " $1")
                                  .trim()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {movement.product_name}
                            {movement.brand && (
                              <div className="text-xs text-muted-foreground">
                                {movement.brand} - {movement.category}
                              </div>
                            )}
                            {movement.lot_code && (
                              <div className="text-xs text-muted-foreground">
                                Lot: {movement.lot_code}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                movement.movetype.includes("Decrease") ||
                                movement.movetype.includes("Pick")
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {movement.movetype.includes("Decrease") ||
                              movement.movetype.includes("Pick")
                                ? "-"
                                : "+"}
                              {movement.quantity.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(movement.movedate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(movement.movedate).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {movement.adduser}
                          </TableCell>
                          {productId && (
                            <TableCell className="font-medium">
                              {movement.current_stock?.toLocaleString() ||
                                "N/A"}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
