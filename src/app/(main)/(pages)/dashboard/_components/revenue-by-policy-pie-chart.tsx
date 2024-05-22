import PieChart from "@/components/charts/pie-chart";
import { CardContent } from "@/components/simple-card";
import { getSalesPast12Months } from "@/utils/functionUtils";
import React from "react";
import { getDashboardGraph } from "../_actions/dashboard-connections";

type Props = {};

const RevenueByPolicyPieChart = async (props: Props) => {
  let barChartData;
  const response = await getDashboardGraph();

  if (response) {
    barChartData = getSalesPast12Months(response);
  }
  return (
    <CardContent className="flex justify-between gap-4">
      <p className="p4 font-semibold">Revenue By Policy</p>
      <PieChart />
    </CardContent>
  );
};

export default RevenueByPolicyPieChart;
