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
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Truck, TrendingUp, DollarSign } from "lucide-react";

interface RouteData {
  route_name: string;
  dispatch_date: string;
  date_label: string;
  total_orders: number;
  total_value: number;
  avg_order_value: number;
}

interface RouteDispatchChartProps {
  data: RouteData[];
  height?: number;
}

export function RouteDispatchChart({
  data,
  height = 400,
}: RouteDispatchChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Dispatch by Route Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No route dispatch data available</p>
              <p className="text-sm mt-2">
                Data will appear when orders are assigned to routes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process data for different chart views
  const processRouteData = () => {
    const routeMap = new Map();

    data.forEach((item) => {
      const key = item.route_name;
      if (!routeMap.has(key)) {
        routeMap.set(key, {
          route_name: item.route_name,
          total_orders: 0,
          total_value: 0,
          today_orders: 0,
          tomorrow_orders: 0,
          today_value: 0,
          tomorrow_value: 0,
          avg_order_value: 0,
        });
      }

      const route = routeMap.get(key);
      route.total_orders += Number(item.total_orders) || 0;
      route.total_value += Number(item.total_value) || 0;

      if (item.date_label === "Today") {
        route.today_orders = Number(item.total_orders) || 0;
        route.today_value = Number(item.total_value) || 0;
      } else if (item.date_label === "Tomorrow") {
        route.tomorrow_orders = Number(item.total_orders) || 0;
        route.tomorrow_value = Number(item.total_value) || 0;
      }
    });

    // Calculate average order values and sort by total orders
    const processedData = Array.from(routeMap.values())
      .map((route) => ({
        ...route,
        avg_order_value:
          route.total_orders > 0 ? route.total_value / route.total_orders : 0,
      }))
      .sort((a, b) => b.total_orders - a.total_orders);

    return processedData.slice(0, 10); // Top 10 routes
  };

  const chartData = processRouteData();

  // Prepare data for timeline view (today vs tomorrow)
  const timelineData = [
    {
      period: "Today",
      ...chartData.reduce(
        (acc, route) => {
          acc.total_orders += route.today_orders;
          acc.total_value += route.today_value;
          return acc;
        },
        { total_orders: 0, total_value: 0 }
      ),
    },
    {
      period: "Tomorrow",
      ...chartData.reduce(
        (acc, route) => {
          acc.total_orders += route.tomorrow_orders;
          acc.total_value += route.tomorrow_value;
          return acc;
        },
        { total_orders: 0, total_value: 0 }
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Dispatch by Route Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="routes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="routes" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              By Route
            </TabsTrigger>
            <TabsTrigger value="value" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Value Analysis
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="routes">
            <ResponsiveContainer width="100%" height={height}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="route_name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                  formatter={(value: number, name: string) => [
                    value,
                    name === "today_orders"
                      ? "Today Orders"
                      : name === "tomorrow_orders"
                      ? "Tomorrow Orders"
                      : "Total Orders",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="today_orders"
                  stackId="orders"
                  fill="hsl(142 76% 36%)"
                  name="Today"
                />
                <Bar
                  dataKey="tomorrow_orders"
                  stackId="orders"
                  fill="hsl(220 70% 50%)"
                  name="Tomorrow"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="value">
            <ResponsiveContainer width="100%" height={height}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="route_name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === "today_value"
                      ? "Today Value"
                      : name === "tomorrow_value"
                      ? "Tomorrow Value"
                      : name === "avg_order_value"
                      ? "Avg Order Value"
                      : "Total Value",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="today_value"
                  stackId="value"
                  fill="hsl(142 76% 36%)"
                  name="Today Value"
                />
                <Bar
                  dataKey="tomorrow_value"
                  stackId="value"
                  fill="hsl(220 70% 50%)"
                  name="Tomorrow Value"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={timelineData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="period"
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="orders"
                    orientation="left"
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="value"
                    orientation="right"
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
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
                    formatter={(value: number, name: string) => [
                      name === "total_value"
                        ? `$${value.toLocaleString()}`
                        : value,
                      name === "total_orders" ? "Orders" : "Value",
                    ]}
                  />
                  <Legend />
                  <Bar
                    yAxisId="orders"
                    dataKey="total_orders"
                    fill="hsl(220 70% 50%)"
                    name="Orders"
                  />
                  <Bar
                    yAxisId="value"
                    dataKey="total_value"
                    fill="hsl(142 76% 36%)"
                    name="Value ($)"
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Active Routes</span>
                  </div>
                  <div className="text-2xl font-bold">{chartData.length}</div>
                  <div className="text-xs text-muted-foreground">
                    Routes with scheduled dispatches
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Avg Orders/Route
                    </span>
                  </div>
                  <div className="text-2xl font-bold">
                    {chartData.length > 0
                      ? Math.round(
                          chartData.reduce(
                            (sum, route) => sum + route.total_orders,
                            0
                          ) / chartData.length
                        )
                      : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Average workload per route
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Avg Order Value</span>
                  </div>
                  <div className="text-2xl font-bold">
                    $
                    {chartData.length > 0
                      ? Math.round(
                          chartData.reduce(
                            (sum, route) => sum + route.avg_order_value,
                            0
                          ) / chartData.length
                        )
                      : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Across all routes
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
