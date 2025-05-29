import React from "react";
import SalesListCard from "../SalesListCard";
import {
  getFastestMovingStock,
  getSlowestMovingStock,
} from "@/services/dashboardService";

interface StockMovementCardProps {
  type: "fastest" | "slowest";
}

const StockMovementCard = async ({ type }: StockMovementCardProps) => {
  const data =
    type === "fastest"
      ? await getFastestMovingStock()
      : await getSlowestMovingStock();

  const title =
    type === "fastest" ? "Fastest Moving Stock" : "Slowest Moving Stock";
  const description =
    type === "fastest"
      ? "Most active products (last 30 days)"
      : "Products needing attention (last 30 days)";

  return (
    <SalesListCard
      title={title}
      description={description}
      data={data || []}
      emptyMessage="No movement data available"
      mapToSalesCard={(item, index) => ({
        name: item.product_name,
        email: `${item.brand} | ${item.category}`,
        saleAmount:
          type === "fastest"
            ? `${Number(item.total_moved).toLocaleString()} units`
            : `${item.days_since_moved || 0} days ago`,
      })}
    />
  );
};

export default StockMovementCard;
