import React from "react";
import SalesListCard from "./SalesListCard";
import {
  getMonthHighestProductTypeSales,
  getMonthTotalProductSales,
} from "@/services/dashboardService";

const ProductTypeTrendCard = async () => {
  const latestSales = await getMonthHighestProductTypeSales();
  const totalProductSales = await getMonthTotalProductSales();

  const description = `You sold${
    totalProductSales?.length
      ? ` ${Number(totalProductSales[0].totalsales).toLocaleString()} `
      : " 0 "
  }products this month.`;

  return (
    <SalesListCard
      title="Top Types"
      description={description}
      data={latestSales || []}
      emptyMessage="No Data this month."
      mapToSalesCard={(item, index) => ({
        name: item.type,
        email: `TOP #${index + 1}`,
        saleAmount: `${Number(item.totalsales).toLocaleString()}`,
      })}
    />
  );
};

export default ProductTypeTrendCard;
