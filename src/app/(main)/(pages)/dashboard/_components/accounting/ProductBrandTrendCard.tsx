import React from "react";
import SalesListCard from "../SalesListCard";
import {
  getMonthHighestProductBrandSales,
  getMonthTotalProductSales,
} from "@/services/dashboardService";

const ProductBrandTrendCard = async () => {
  const latestSales = await getMonthHighestProductBrandSales();
  const totalProductSales = await getMonthTotalProductSales();

  const description = `You sold${
    totalProductSales?.length
      ? ` ${Number(totalProductSales[0].totalsales).toLocaleString()} `
      : " 0 "
  }products this month.`;

  return (
    <SalesListCard
      title="Top Brands"
      description={description}
      data={latestSales || []}
      emptyMessage="No Data this month."
      mapToSalesCard={(item, index) => ({
        name: item.brand,
        email: `TOP #${index + 1}`,
        saleAmount: `${Number(item.totalsales).toLocaleString()}`,
      })}
    />
  );
};

export default ProductBrandTrendCard;
