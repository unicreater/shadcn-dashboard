import { CardContent } from "@/components/simple-card";
import React from "react";
import { generateDashboardAreaChart } from "@/utils/dashboardUtils";
import SimpleAreaChart from "@/components/charts/simple-area-chart";

type Props = {};

const MonthlyReturnRevenue = async (props: Props) => {
  const barChart2Data = await generateDashboardAreaChart();

  return (
    <CardContent className="flex justify-between gap-4">
      <p className="p4 font-semibold">MRR</p>
      <SimpleAreaChart data={barChart2Data} />
    </CardContent>
  );
};

export default MonthlyReturnRevenue;
