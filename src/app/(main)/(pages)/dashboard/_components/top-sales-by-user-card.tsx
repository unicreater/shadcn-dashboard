import SalesCard from "@/components/sales-card";
import { CardContent } from "@/components/simple-card";
import React from "react";
import {
  getCurrentMonthTotalSales,
  getTopSalesByUserChart,
} from "../_actions/dashboard-connections";

type Props = {};

const TopSalesByUserCard = async (props: Props) => {
  const latestSales = await getTopSalesByUserChart();
  const totalSales = await getCurrentMonthTotalSales();

  return (
    <>
      {latestSales?.length ? (
        <CardContent className="flex justify-between gap-4">
          <section>
            <p>Top Sales</p>
            <p className="text-sm text-gray-400">
              You made {totalSales?.length ? totalSales[0].count : "0"} sales
              this month.
            </p>
          </section>
          {latestSales.map((d: any, i: any) => (
            <SalesCard
              key={i}
              email={d.phone}
              name={d.name}
              saleAmount={`+$${d.totalprofit}`}
            />
          ))}
        </CardContent>
      ) : (
        <div className="mt-28 flex text-muted-foreground items-center justify-center">
          No Data this month.
        </div>
      )}
    </>
  );
};

export default TopSalesByUserCard;
