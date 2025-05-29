"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Package, Clock, CheckCircle } from "lucide-react";

interface DispatchData {
  dispatch_date: string;
  date_label: string;
  total_orders: number;
  ready_orders: number;
  pending_orders: number;
  partial_orders: number;
  total_value: number;
  ready_value: number;
}

interface DispatchSummaryChartProps {
  data: DispatchData[];
  height?: number;
}

const STATUS_COLORS = {
  ready: "#22c55e", // green-500
  pending: "#ef4444", // red-500
  partial: "#f59e0b", // amber-500
};

export function DispatchSummaryChart({
  data,
  height = 400,
}: DispatchSummaryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No dispatch data available</p>
              <p className="text-sm mt-2">
                Orders will appear when scheduled for delivery
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    total_orders: Number(item.total_orders) || 0,
    ready_orders: Number(item.ready_orders) || 0,
    pending_orders: Number(item.pending_orders) || 0,
    partial_orders: Number(item.partial_orders) || 0,
    total_value: Number(item.total_value) || 0,
    ready_value: Number(item.ready_value) || 0,
    readiness_percentage:
      item.total_orders > 0
        ? Math.round(
            (Number(item.ready_orders) / Number(item.total_orders)) * 100
          )
        : 0,
  }));

  // Prepare pie chart data for today and tomorrow
  const preparePieData = (dayData: any) =>
    [
      {
        name: "Ready",
        value: dayData.ready_orders,
        color: STATUS_COLORS.ready,
      },
      {
        name: "Partial",
        value: dayData.partial_orders,
        color: STATUS_COLORS.partial,
      },
      {
        name: "Pending",
        value: dayData.pending_orders,
        color: STATUS_COLORS.pending,
      },
    ].filter((item) => item.value > 0);

  const todayData = chartData.find((d) => d.date_label === "Today");
  const tomorrowData = chartData.find((d) => d.date_label === "Tomorrow");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Dispatch Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="status">Status Breakdown</TabsTrigger>
            <TabsTrigger value="value">Value Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
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
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
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
                  dataKey="total_orders"
                  fill="hsl(220 70% 50%)"
                  name="Total Orders"
                />
                <Bar
                  dataKey="ready_orders"
                  fill={STATUS_COLORS.ready}
                  name="Ready Orders"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="status">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {todayData && (
                <div>
                  <h4 className="text-sm font-medium mb-4 text-center">
                    {"Today's Status"}
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={preparePieData(todayData)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                      >
                        {preparePieData(todayData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {tomorrowData && (
                <div>
                  <h4 className="text-sm font-medium mb-4 text-center">
                    {"Tomorrow's Status"}
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={preparePieData(tomorrowData)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                      >
                        {preparePieData(tomorrowData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="value">
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
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "Value",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="total_value"
                  fill="hsl(220 70% 50%)"
                  name="Total Value"
                />
                <Bar
                  dataKey="ready_value"
                  fill={STATUS_COLORS.ready}
                  name="Ready Value"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
