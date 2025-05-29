import React from "react";
import SalesListCard from "../SalesListCard";
import {
  getCurrentMonthTotalSales,
  getTopSalesByUserChart,
} from "@/services/dashboardService";

const TopSalesByUserCard = async () => {
  const latestSales = await getTopSalesByUserChart();
  const totalSales = await getCurrentMonthTotalSales();

  const description = `You made ${
    totalSales?.length ? totalSales[0].count : "0"
  } sales this month.`;

  return (
    <SalesListCard
      title="Top Sales"
      description={description}
      data={latestSales || []}
      emptyMessage="No Data this month."
      mapToSalesCard={(item) => ({
        name: item.name,
        email: item.phone,
        saleAmount: `+$${Number(item.totalprofit).toLocaleString()}`,
      })}
    />
  );
};

export default TopSalesByUserCard;
