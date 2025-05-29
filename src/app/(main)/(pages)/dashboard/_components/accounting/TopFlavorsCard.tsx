import React from "react";
import SalesListCard from "../SalesListCard";
import {
  getMonthHighestProductFlavors,
  getMonthTotalProductSales,
} from "@/services/dashboardService";

const TopFlavorsCard = async () => {
  const latestSales = await getMonthHighestProductFlavors();
  const totalProductSales = await getMonthTotalProductSales();

  const description = `You sold${
    totalProductSales?.length
      ? ` ${Number(totalProductSales[0].totalsales).toLocaleString()} `
      : " 0 "
  }products this month.`;

  return (
    <SalesListCard
      title="Top Flavors"
      description={description}
      data={latestSales || []}
      emptyMessage="No Data this month."
      mapToSalesCard={(item, index) => ({
        name: item.flavor,
        email: `TOP #${index + 1}`,
        saleAmount: `${Number(item.totalsales).toLocaleString()}`,
      })}
    />
  );
};

export default TopFlavorsCard;
