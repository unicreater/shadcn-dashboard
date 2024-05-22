"use client";

import React from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export type SimpleAreaChartProps = {
  data: {
    name: string;
    total: number;
  }[];
};

// const data = [
//   {
//     name: "Page A",
//     total: 4000,
//   },
//   {
//     name: "Page B",
//     total: 3000,
//   },
//   {
//     name: "Page C",
//     total: 2000,
//   },
//   {
//     name: "Page D",
//     total: 2780,
//   },
//   {
//     name: "Page E",
//     total: 1890,
//   },
//   {
//     name: "Page F",
//     total: 2390,
//   },
//   {
//     name: "Page G",
//     total: 3490,
//   },
// ];

export default function SimpleAreaChart({ data }: SimpleAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        {/* <CartesianGrid strokeDasharray="1 1" /> */}
        <XAxis dataKey="name" />
        <YAxis
          tickFormatter={(value) => `$${value}`}
          type="number"
          domain={[0, 10000]}
        />
        <Tooltip />
        <Area dataKey="total" stroke="#8884d8" fill="#8884d8" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
