"use client";

import React from "react";
import {
  BarChart as BarGraph,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
} from "recharts";

export type BarChartProps = {
  data:
    | {
        name: string;
        total: number;
      }[]
    | undefined;
};

export default function BarChart({ data }: BarChartProps) {
  return (
    <>
      {data?.length ? (
        <ResponsiveContainer width={"100%"} height={350}>
          <BarGraph data={data}>
            <XAxis
              dataKey={"name"}
              tickLine={false}
              axisLine={false}
              stroke="#ffffff"
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#ffffff"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip />
            <Bar dataKey={"total"} radius={[4, 4, 0, 0]} fill="#9792f6" />
          </BarGraph>
        </ResponsiveContainer>
      ) : (
        <div className="mt-28 flex text-muted-foreground items-center justify-center">
          No Data
        </div>
      )}
    </>
  );
}
