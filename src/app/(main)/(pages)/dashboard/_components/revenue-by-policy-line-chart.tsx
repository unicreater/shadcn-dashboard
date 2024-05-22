import { CardContent } from "@/components/simple-card";
import React from "react";
import CustomizedLabelLineChart from "@/components/CustomizedLabelLineChart";

type Props = {};

const RevenueByPolicyLineChart = async (props: Props) => {
  return (
    <CardContent className="flex justify-between gap-4">
      <p className="p4 font-semibold">Revenue By Policy</p>
      <CustomizedLabelLineChart />
    </CardContent>
  );
};

export default RevenueByPolicyLineChart;
