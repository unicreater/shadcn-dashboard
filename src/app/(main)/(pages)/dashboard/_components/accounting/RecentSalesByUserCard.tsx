import React from "react";
import SalesListCard from "../SalesListCard";
import {
  getCurrentMonthTotalSales,
  getSalesByUserChart,
} from "@/services/dashboardService";

const RecentSalesByUserCard = async () => {
  const latestSales = await getSalesByUserChart();
  const totalSales = await getCurrentMonthTotalSales();

  const description = `You made ${
    totalSales?.length ? totalSales[0].count : "0"
  } sales this month.`;

  return (
    <SalesListCard
      title="Recent Sales"
      description={description}
      data={latestSales || []}
      emptyMessage="No Data"
      mapToSalesCard={(item) => ({
        name: item.name,
        email: item.phone,
        saleAmount: `+$${Number(item.totalprofit).toLocaleString()}`,
      })}
    />
  );
};

export default RecentSalesByUserCard;
