"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueData {
  month: string;
  name: string;
  totalprofit: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  height?: number;
}

export function RevenueChart({ data, height = 400 }: RevenueChartProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="w-full rounded-md border p-4">
        <h3 className="text-lg font-medium mb-4">Revenue Over Time</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <p>No revenue data available</p>
            <p className="text-sm mt-2">
              Data will appear once orders are processed
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Format data for chart (reverse to show chronological order)
  const chartData = [...data].reverse().map((item) => ({
    ...item,
    totalprofit: Number(item.totalprofit) || 0,
    formattedProfit: `$${Number(item.totalprofit || 0).toLocaleString()}`,
  }));

  return (
    <div className="w-full rounded-md border p-4">
      <h3 className="text-lg font-medium mb-4">Revenue Over Time</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          {/* <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /> */}
          <CartesianGrid strokeDasharray="3 3" stroke="" />
          <Tooltip
            formatter={(value: number) => [
              `$${value.toLocaleString()}`,
              "Revenue",
            ]}
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #8884d8",
              borderRadius: "6px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="totalprofit"
            stroke="#8884d8"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
