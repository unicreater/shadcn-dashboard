"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface MonthlyProfitData {
  month: string;
  name: string;
  totalprofit: number;
}

interface MonthlyProfitChartProps {
  data: MonthlyProfitData[];
  height?: number;
}

const COLORS = [
  "#8884d8",
  "#8884d8",
  "#8884d8",
  "#8884d8",
  "#8884d8",
  "#8884d8",
  "#8884d8",
  "#8884d8",
  "#8884d8",
  "#8884d8",
  "#8884d8",
  "#8884d8",
];

// Generate all 12 months for current year
const generateCompleteYearData = (data: MonthlyProfitData[]) => {
  const currentYear = new Date().getFullYear();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Create a map of existing data for quick lookup
  const dataMap = new Map();
  data?.forEach((item) => {
    // Extract month from the data (assuming format like "Jan 24" or similar)
    const monthKey = item.name || "";
    dataMap.set(monthKey, item);
  });

  // Generate complete year data
  const completeData = monthNames.map((monthName, index) => {
    const monthDate = new Date(currentYear, index, 1);
    const monthKey = monthDate.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }); // "Jan 24"

    // Check if we have data for this month
    const existingData = dataMap.get(monthKey);

    if (existingData) {
      return {
        ...existingData,
        totalprofit: Number(existingData.totalprofit) || 0,
        formattedProfit: `$${Number(
          existingData.totalprofit || 0
        ).toLocaleString()}`,
      };
    } else {
      // Create empty data for missing month
      return {
        month: monthDate.toISOString(),
        name: monthKey,
        totalprofit: 0,
        formattedProfit: "$0",
      };
    }
  });

  return completeData;
};

export function MonthlyProfitChart({
  data,
  height = 400,
}: MonthlyProfitChartProps) {
  // Generate complete year data with missing months filled with zeros
  const chartData = generateCompleteYearData(data || []);

  // Calculate some stats (only from actual data, not zeros)
  const actualData = chartData.filter((item) => item.totalprofit > 0);
  const totalProfit = actualData.reduce(
    (sum, item) => sum + item.totalprofit,
    0
  );
  const averageProfit =
    actualData.length > 0 ? totalProfit / actualData.length : 0;
  const maxProfit = Math.max(...chartData.map((item) => item.totalprofit));

  return (
    <div className="w-full rounded-md border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          Monthly Profit ({new Date().getFullYear()})
        </h3>
        <div className="text-right text-sm text-foreground">
          <div>Total: ${totalProfit.toLocaleString()}</div>
          <div>Average: ${Math.round(averageProfit).toLocaleString()}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {/* <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /> */}
          <CartesianGrid strokeDasharray="3 3" stroke="" />
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
          <Tooltip
            formatter={(value: number) => [
              `$${value.toLocaleString()}`,
              "Profit",
            ]}
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{
              backgroundColor: "white",
              // border: "1px solid #e2e8f0",
              borderRadius: "6px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Bar dataKey="totalprofit" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={
                  entry.totalprofit === maxProfit && entry.totalprofit > 0
                    ? 1
                    : entry.totalprofit > 0
                    ? 0.8
                    : 0.3
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Show data availability info */}
      <div className="text-xs text-muted-foreground mt-2">
        Showing {actualData.length} months with data out of {chartData.length}{" "}
        months
      </div>
    </div>
  );
}
