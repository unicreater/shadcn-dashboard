import React from "react";
import OverviewGraph from "./overview-card";
import SalesByUserCard from "./sales-by-user-card";
import MonthlyReturnRevenue from "./monthly-return-revenue";
import RevenueByPolicyPieChart from "./revenue-by-policy-pie-chart";
import RevenueByPolicyLineChart from "./revenue-by-policy-line-chart";
import ProductBrandTrendCard from "./trend-product-brand-card";
import ProductTypeTrendCard from "./trend-product-type-card";
import ProductBrandCategoryTrendCard from "./trend-product-brand-category-card";

type Props = {};

const DashboardGraph = async (props: Props) => {
  return (
    <section className="grid grid-cols-1 gap-4 transition-all lg:grid-cols-2">
      <OverviewGraph />
      <SalesByUserCard />
      <ProductBrandTrendCard />
      <ProductTypeTrendCard />
      <ProductBrandCategoryTrendCard />
      <RevenueByPolicyPieChart />
      <MonthlyReturnRevenue />
      <RevenueByPolicyLineChart />
    </section>
  );
};

export default DashboardGraph;
