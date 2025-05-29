"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { CardContent } from "@/components/simple-card";

interface MovementData {
  movement_date: string;
  date_label: string;
  total_movements: number;
  unique_products: number;
  picked_quantity: number;
  reverted_quantity: number;
}

interface InventoryMovementChartProps {
  data: MovementData[];
  height?: number;
}

export function InventoryMovementChart({
  data,
  height = 400,
}: InventoryMovementChartProps) {
  if (!data || data.length === 0) {
    return (
      <CardContent>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Inventory Movement Frequency
        </h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <p>No movement data available</p>
            <p className="text-sm mt-2">
              Data will appear once inventory moves
            </p>
          </div>
        </div>
      </CardContent>
    );
  }

  const chartData = [...data].reverse().map((item) => ({
    ...item,
    total_movements: Number(item.total_movements) || 0,
    unique_products: Number(item.unique_products) || 0,
    picked_quantity: Number(item.picked_quantity) || 0,
    reverted_quantity: Number(item.reverted_quantity) || 0,
  }));

  return (
    <CardContent>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Inventory Movement Frequency (Last 30 Days)
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
          <Line
            type="monotone"
            dataKey="total_movements"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            name="Total Movements"
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="picked_quantity"
            stroke="hsl(220 70% 50%)"
            strokeWidth={2}
            name="Picked Quantity"
            dot={{ fill: "hsl(220 70% 50%)", strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  );
}
