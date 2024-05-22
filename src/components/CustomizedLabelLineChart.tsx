"use client";

import React, { PureComponent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    tv: 3600,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    tv: 1400,

    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    tv: 6000,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    tv: 9200,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    tv: 3000,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    tv: 3600,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    tv: 1200,
    amt: 2100,
  },
];

export type CustomizedLabelLineChartProps = {
  data: {
    name: string;
    total: number;
  }[];
};

export default function CustomizedLabelLineChart() {
  return (
    <ResponsiveContainer width={"100%"} height={350}>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {/* <XAxis dataKey="name" height={60} tick={<CustomizedAxisTick />} /> */}
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="pv"
          stroke="#8884d8"
          // label={<CustomizedLabel />}
        />
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        <Line type="monotone" dataKey="tv" stroke="#83cc97" />
      </LineChart>
    </ResponsiveContainer>
  );
}
