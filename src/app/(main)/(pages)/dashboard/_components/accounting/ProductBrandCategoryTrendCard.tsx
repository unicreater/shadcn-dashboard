import React from "react";
import SalesListCard from "../SalesListCard";
import {
  getMonthHighestProductBrandCategorySales,
  getMonthTotalProductSales,
} from "@/services/dashboardService";

const ProductBrandCategoryTrendCard = async () => {
  const latestSales = await getMonthHighestProductBrandCategorySales();
  const totalProductSales = await getMonthTotalProductSales();

  const description = `You sold${
    totalProductSales?.length
      ? ` ${Number(totalProductSales[0].totalsales).toLocaleString()} `
      : " 0 "
  }products this month.`;

  return (
    <SalesListCard
      title="Top Categories By Brand"
      description={description}
      data={latestSales || []}
      emptyMessage="No Data this month."
      mapToSalesCard={(item, index) => ({
        name: `${item.brand} | ${item.category}`,
        email: `TOP #${index + 1}`,
        saleAmount: `${Number(item.totalsales).toLocaleString()}`,
      })}
    />
  );
};

export default ProductBrandCategoryTrendCard;
