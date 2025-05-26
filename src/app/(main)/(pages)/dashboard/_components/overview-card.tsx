import BarChart from "@/components/charts/bar-chart";
import { CardContent } from "@/components/simple-card";
import { getSalesPast12Months } from "@/utils/functionUtils";
import React from "react";
import { getDashboardGraph } from "../_actions/dashboard-connections";

type Props = {};

const OverviewGraph = async (props: Props) => {
  let barChartData;
  const response = await getDashboardGraph();

  if (response) {
    barChartData = getSalesPast12Months(response);
  }

  // console.log(`barChartData: ${JSON.stringify(barChartData)}`);
  return (
    <CardContent>
      <p className="p4 font-semibold">Overview</p>
      <BarChart data={barChartData} />
    </CardContent>
  );
};

export default OverviewGraph;
