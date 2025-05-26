import PieChart from "@/components/charts/pie-chart";
import { CardContent } from "@/components/simple-card";
import {
  formatTotalSalesByPolicy,
  getSalesPast12Months,
} from "@/utils/functionUtils";
import React from "react";
import {
  getDashboardGraph,
  getMonthlyTotalSalesByPolicy,
} from "../_actions/dashboard-connections";

type Props = {};

const RevenueByPolicyPieChart = async (props: Props) => {
  let data;
  // const response = await getDashboardGraph();
  const response = await getMonthlyTotalSalesByPolicy();

  if (response) {
    data = formatTotalSalesByPolicy(response);
  }
  return (
    data && (
      <CardContent className="flex justify-between gap-4">
        <p className="p4 font-semibold">Total Sales By Policy</p>
        <PieChart data={data} />
      </CardContent>
    )
  );
};

export default RevenueByPolicyPieChart;
