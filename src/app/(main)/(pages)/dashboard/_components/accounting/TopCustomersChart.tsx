"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CustomerData {
  name: string;
  phone?: string;
  totalprofit: number;
}

interface TopCustomersChartProps {
  data: CustomerData[];
  height?: number;
  title?: string;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export function TopCustomersChart({
  data,
  height = 300,
  title = "Top Customers",
}: TopCustomersChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full rounded-md border p-4">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p>No customer data available</p>
            <p className="text-sm mt-2">
              Data will appear once orders are processed
            </p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    ...item,
    value: Number(item.totalprofit) || 0,
    color: COLORS[index % COLORS.length],
    displayName: item.name || "Unknown Customer",
  }));

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full rounded-md border p-4 bg-white">
      <h3 className="text-lg font-medium mb-4">{title}</h3>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ displayName, percent }) =>
                  `${displayName}: ${(percent * 100).toFixed(1)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:w-64 mt-4 lg:mt-0">
          <h4 className="font-medium mb-2">Customer Breakdown</h4>
          <div className="space-y-2">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="truncate max-w-24">{item.displayName}</span>
                </div>
                <span className="font-medium">
                  ${item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Total:</span>
              <span>${totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
