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

interface SalesData {
  month?: string;
  week?: string;
  day?: string;
  name?: string;
  totalsales: number;
}

interface SalesChartProps {
  data: SalesData[];
  title?: string;
  dataKey?: string;
  height?: number;
  type?: "monthly" | "weekly" | "daily";
}

export function SalesChart({
  data,
  title = "Sales Over Time",
  dataKey = "totalsales",
  height = 300,
  type = "monthly",
}: SalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full rounded-md border p-4">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-foreground">
          <div className="text-center">
            <p>No sales data available</p>
            <p className="text-sm mt-2">
              Data will appear once orders are processed
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Format data based on type
  const chartData = [...data].reverse().map((item, index) => {
    const baseData = {
      ...item,
      [dataKey]: Number(item[dataKey]) || 0,
      index: index + 1,
    };

    // Add appropriate label based on type
    if (type === "daily" && item.day) {
      baseData.label = new Date(item.day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (type === "weekly" && item.week) {
      baseData.label = new Date(item.week).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (item.name) {
      baseData.label = item.name;
    } else {
      baseData.label = `Period ${index + 1}`;
    }

    return baseData;
  });

  const totalSales = chartData.reduce((sum, item) => sum + item[dataKey], 0);

  return (
    <div className="w-full rounded-md border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="text-sm text-muted-foreground">
          Total: {totalSales.toLocaleString()} sales
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {/* <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /> */}
          <CartesianGrid strokeDasharray="3 3" stroke="" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), "Sales"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #8884d8",
              borderRadius: "6px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#8884d8", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
